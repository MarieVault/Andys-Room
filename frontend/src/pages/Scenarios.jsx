import React, { useEffect, useState } from 'react';
import styles from './Scenarios.module.css';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scenarios')
      .then(r => r.json())
      .then(data => { setScenarios(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Scenarios</h1>
        <span className={styles.count}>{scenarios.length} ready to play</span>
      </div>
      {scenarios.length === 0 ? (
        <div className={styles.empty}>
          <p>No scenarios defined yet.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Ask Andy to create a scenario and it'll appear here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {scenarios.map(s => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardTop}>
                <h2 className={styles.scenarioTitle}>{s.title}</h2>
                {s.setting_name && (
                  <span className={styles.setting}>📍 {s.setting_name}</span>
                )}
              </div>
              {s.description && <p className={styles.description}>{s.description}</p>}
              {s.characters_suggested && (
                <p className={styles.chars}>👤 {s.characters_suggested}</p>
              )}
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
