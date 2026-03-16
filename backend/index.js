import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'andy.db');
const PORTRAITS_PATH = path.resolve(__dirname, '../../attachments/characters');

const app = express();
app.use(cors());
app.use(express.json());

// Run migrations
try { db.exec(`ALTER TABLE characters ADD COLUMN tags TEXT`); } catch(e) {}

// Serve character portraits
app.use('/portraits', express.static(PORTRAITS_PATH));

// Init DB
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    appearance TEXT,
    personality TEXT,
    voice TEXT,
    notes TEXT,
    portrait_file TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  -- Add tags column if upgrading existing DB
  CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY);


  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS story_scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER REFERENCES stories(id),
    scene_number INTEGER,
    content TEXT,
    characters_involved TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    atmosphere TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    setting_id INTEGER REFERENCES settings(id),
    description TEXT,
    characters_suggested TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Characters ---
app.get('/api/characters', (req, res) => {
  const { search, tag } = req.query;
  let query = 'SELECT * FROM characters WHERE 1=1';
  const params = [];
  if (search) { query += ' AND (name LIKE ? OR role LIKE ? OR tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (tag) { query += ' AND tags LIKE ?'; params.push(`%${tag}%`); }
  query += ' ORDER BY name';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.get('/api/characters/tags', (req, res) => {
  const rows = db.prepare('SELECT tags FROM characters WHERE tags IS NOT NULL AND tags != ""').all();
  const tagSet = new Set();
  rows.forEach(r => r.tags.split(',').forEach(t => { const trimmed = t.trim(); if (trimmed) tagSet.add(trimmed); }));
  res.json([...tagSet].sort());
});

app.get('/api/characters/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/characters', (req, res) => {
  const { name, role, appearance, personality, voice, notes, portrait_file, tags } = req.body;
  const result = db.prepare(
    'INSERT INTO characters (name, role, appearance, personality, voice, notes, portrait_file, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, role, appearance, personality, voice, notes, portrait_file, tags);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/characters/:id', (req, res) => {
  const { name, role, appearance, personality, voice, notes, portrait_file, tags } = req.body;
  db.prepare(
    'UPDATE characters SET name=?, role=?, appearance=?, personality=?, voice=?, notes=?, portrait_file=?, tags=? WHERE id=?'
  ).run(name, role, appearance, personality, voice, notes, portrait_file, tags, req.params.id);
  res.json({ ok: true });
});

// --- Stories ---
app.get('/api/stories', (req, res) => {
  const rows = db.prepare('SELECT * FROM stories ORDER BY updated_at DESC').all();
  res.json(rows);
});

app.get('/api/stories/:id', (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Not found' });
  const scenes = db.prepare('SELECT * FROM story_scenes WHERE story_id = ? ORDER BY scene_number').all(req.params.id);
  res.json({ ...story, scenes });
});

app.post('/api/stories', (req, res) => {
  const { title, summary, status } = req.body;
  const result = db.prepare(
    'INSERT INTO stories (title, summary, status) VALUES (?, ?, ?)'
  ).run(title, summary, status || 'active');
  res.json({ id: result.lastInsertRowid });
});

app.post('/api/stories/:id/scenes', (req, res) => {
  const { scene_number, content, characters_involved } = req.body;
  const result = db.prepare(
    'INSERT INTO story_scenes (story_id, scene_number, content, characters_involved) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, scene_number, content, characters_involved);
  db.prepare("UPDATE stories SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ id: result.lastInsertRowid });
});

// --- Settings ---
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings ORDER BY name').all();
  res.json(rows);
});

app.post('/api/settings', (req, res) => {
  const { name, description, atmosphere, tags } = req.body;
  const result = db.prepare(
    'INSERT INTO settings (name, description, atmosphere, tags) VALUES (?, ?, ?, ?)'
  ).run(name, description, atmosphere, tags);
  res.json({ id: result.lastInsertRowid });
});

// --- Scenarios ---
app.get('/api/scenarios', (req, res) => {
  const rows = db.prepare(`
    SELECT sc.*, se.name as setting_name
    FROM scenarios sc LEFT JOIN settings se ON sc.setting_id = se.id
    ORDER BY sc.title
  `).all();
  res.json(rows);
});

app.post('/api/scenarios', (req, res) => {
  const { title, setting_id, description, characters_suggested, tags } = req.body;
  const result = db.prepare(
    'INSERT INTO scenarios (title, setting_id, description, characters_suggested, tags) VALUES (?, ?, ?, ?, ?)'
  ).run(title, setting_id, description, characters_suggested, tags);
  res.json({ id: result.lastInsertRowid });
});

// --- Session Launch ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
  });
  return resp.json();
}

app.post('/api/sessions/launch', async (req, res) => {
  const { character_ids, story_id, setting_id, scenario_id, note } = req.body;

  // Gather context
  const characters = character_ids?.length
    ? character_ids.map(id => db.prepare('SELECT * FROM characters WHERE id=?').get(id)).filter(Boolean)
    : [];
  const story = story_id ? db.prepare('SELECT * FROM stories WHERE id=?').get(story_id) : null;
  const setting = setting_id ? db.prepare('SELECT * FROM settings WHERE id=?').get(setting_id) : null;
  const scenario = scenario_id ? db.prepare('SELECT * FROM scenarios WHERE id=?').get(scenario_id) : null;

  // Build Telegram message with full character context
  let msg = '🎭 *Session Launch*\n\n';

  if (characters.length) {
    for (const c of characters) {
      msg += `*${c.name}* — ${c.role}\n`;
      if (c.appearance) msg += `Appearance: ${c.appearance.replace(/\n- /g, ', ').replace(/^- /, '')}\n`;
      if (c.personality) msg += `Personality: ${c.personality.replace(/\n- /g, ', ').replace(/^- /, '')}\n`;
      if (c.voice) msg += `Voice: ${c.voice.replace(/\n- /g, ', ').replace(/^- /, '')}\n`;
      if (c.notes) msg += `Notes: ${c.notes.replace(/\n- /g, ', ').replace(/^- /, '')}\n`;
      msg += '\n';
    }
  }

  if (setting) msg += `*Setting:* ${setting.name} — ${setting.atmosphere || ''}\n${setting.description || ''}\n\n`;
  if (scenario) msg += `*Scenario:* ${scenario.title}\n${scenario.description || ''}\n\n`;
  if (story) msg += `*Continuing story:* ${story.title}\n${story.summary || ''}\n\n`;
  if (note) msg += `*Note from Mark:* ${note}\n\n`;
  msg += '_Load this context and confirm you are ready._';

  // Create or update story record
  let activeStoryId = story_id;
  if (!story_id && scenario) {
    const result = db.prepare('INSERT INTO stories (title, summary, status) VALUES (?, ?, ?)').run(
      scenario.title,
      scenario.description || '',
      'active'
    );
    activeStoryId = result.lastInsertRowid;
  }

  await sendTelegram(msg);
  res.json({ ok: true, story_id: activeStoryId });
});

// --- Save Session (called by Andy from container) ---
app.post('/api/sessions/save', async (req, res) => {
  const { story_id, title, summary, content, characters_involved } = req.body;

  let sid = story_id;
  if (!sid) {
    const result = db.prepare('INSERT INTO stories (title, summary, status) VALUES (?, ?, ?)').run(
      title || 'Untitled Session', summary || '', 'active'
    );
    sid = result.lastInsertRowid;
  } else {
    db.prepare("UPDATE stories SET updated_at=datetime('now'), status='active' WHERE id=?").run(sid);
    if (summary) db.prepare('UPDATE stories SET summary=? WHERE id=?').run(summary, sid);
  }

  const sceneCount = db.prepare('SELECT COUNT(*) as n FROM story_scenes WHERE story_id=?').get(sid);
  db.prepare('INSERT INTO story_scenes (story_id, scene_number, content, characters_involved) VALUES (?,?,?,?)').run(
    sid, (sceneCount.n || 0) + 1, content, characters_involved || ''
  );

  res.json({ ok: true, story_id: sid });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Andy API running on port ${PORT}`));
