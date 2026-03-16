import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Launch.module.css';

export default function Launch() {
  const [characters, setCharacters] = useState([]);
  const [stories, setStories] = useState([]);
  const [settings, setSettings] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [storyId, setStoryId] = useState('');
  const [settingId, setSettingId] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [note, setNote] = useState('');
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/characters').then(r => r.json()),
      fetch('/api/stories').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/scenarios').then(r => r.json()),
    ]).then(([c, st, se, sc]) => {
      setCharacters(c); setStories(st); setSettings(se); setScenarios(sc);
    });
  }, []);

  const toggleChar = (id) => setSelectedChars(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const launch = async () => {
    setLaunching(true);
    await fetch('/api/sessions/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character_ids: selectedChars,
        story_id: storyId || null,
        setting_id: settingId || null,
        scenario_id: scenarioId || null,
        note: note || null
      })
    });
    setLaunching(false);
    setLaunched(true);
  };

  if (launched) return (
    <div className={styles.success}>
      <div className={styles.successIcon}>🎭</div>
      <h2>Session launched!</h2>
      <p>Check Telegram — Andy is ready to go.</p>
      <button className={styles.btn} onClick={() => { setLaunched(false); setSelectedChars([]); setStoryId(''); setSettingId(''); setScenarioId(''); setNote(''); }}>
        Launch another
      </button>
    </div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Launch Session</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Characters</h2>
        <div className={styles.charGrid}>
          {characters.map(c => (
            <button
              key={c.id}
              className={styles.charCard + (selectedChars.includes(c.id) ? ' ' + styles.charSelected : '')}
              onClick={() => toggleChar(c.id)}
            >
              {c.portrait_file && <img src={'/portraits/' + c.portrait_file} alt={c.name} className={styles.charImg} />}
              <span className={styles.charName}>{c.name}</span>
              {selectedChars.includes(c.id) && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Context <span className={styles.optional}>(pick one or none)</span></h2>

        <div className={styles.contextGroup}>
          <label className={styles.label}>Continue existing story</label>
          <select className={styles.select} value={storyId} onChange={e => { setStoryId(e.target.value); setScenarioId(''); }}>
            <option value="">— None —</option>
            {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        <div className={styles.contextGroup}>
          <label className={styles.label}>Start from scenario</label>
          <select className={styles.select} value={scenarioId} onChange={e => { setScenarioId(e.target.value); setStoryId(''); }}>
            <option value="">— None —</option>
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        <div className={styles.contextGroup}>
          <label className={styles.label}>Setting</label>
          <select className={styles.select} value={settingId} onChange={e => setSettingId(e.target.value)}>
            <option value="">— None —</option>
            {settings.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Note <span className={styles.optional}>(optional)</span></h2>
        <textarea
          className={styles.textarea}
          placeholder="Any extra context for Andy..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />
      </section>

      <button
        className={styles.launchBtn}
        onClick={launch}
        disabled={launching || selectedChars.length === 0}
      >
        {launching ? 'Launching...' : '🎭 Launch Session'}
      </button>
    </div>
  );
}
