import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Stories.module.css';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then(r => r.json())
      .then(data => { setStories(data); setLoading(false); });
  }, []);

  const statusColor = { active: '#a78bfa', paused: '#fb923c', completed: '#34d399' };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Stories</h1>
        <span className={styles.count}>{stories.length} total</span>
      </div>
      {stories.length === 0 ? (
        <div className={styles.empty}>
          <p>No stories yet.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Start a roleplay session with Andy and stories will appear here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {stories.map(s => (
            <Link to={`/stories/${s.id}`} key={s.id} className={styles.card}>
              <div className={styles.cardTop}>
                <h2 className={styles.storyTitle}>{s.title}</h2>
                <span className={styles.status} style={{ color: statusColor[s.status] || '#aaa' }}>
                  {s.status}
                </span>
              </div>
              {s.summary && <p className={styles.summary}>{s.summary}</p>}
              <p className={styles.date}>{new Date(s.updated_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
