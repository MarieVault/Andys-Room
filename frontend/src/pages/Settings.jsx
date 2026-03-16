import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <span className={styles.count}>{settings.length} locations</span>
      </div>
      {settings.length === 0 ? (
        <div className={styles.empty}>
          <p>No settings defined yet.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Tell Andy to add a roleplay setting and it'll appear here.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {settings.map(s => (
            <div key={s.id} className={styles.card}>
              <h2 className={styles.name}>{s.name}</h2>
              {s.atmosphere && <p className={styles.atmosphere}>{s.atmosphere}</p>}
              {s.description && <p className={styles.description}>{s.description}</p>}
              {s.tags && (
                <div className={styles.tags}>
                  {s.tags.split(',').map(t => (
                    <span key={t} className={styles.tag}>{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
