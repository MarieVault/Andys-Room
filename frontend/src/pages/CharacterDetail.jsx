import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './CharacterDetail.module.css';

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionContent}>
        {content.split('\n').map((line, i) => (
          <p key={i}>{line.replace(/^- /, '')}</p>
        ))}
      </div>
    </div>
  );
}

export default function CharacterDetail() {
  const { id } = useParams();
  const [char, setChar] = useState(null);

  useEffect(() => {
    fetch(`/api/characters/${id}`)
      .then(r => r.json())
      .then(setChar);
  }, [id]);

  if (!char) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <Link to="/characters" className={styles.back}>← Back to Characters</Link>
      <div className={styles.hero}>
        <div className={styles.portrait}>
          {char.portrait_file
            ? <img src={`/portraits/${char.portrait_file}`} alt={char.name} />
            : <div className={styles.noPortrait}>?</div>
          }
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.name}>{char.name}</h1>
          <p className={styles.role}>{char.role}</p>
          <div className={styles.badge}>Character Profile</div>
        </div>
      </div>
      <div className={styles.sections}>
        <Section title="Appearance" content={char.appearance} />
        <Section title="Personality" content={char.personality} />
        <Section title="Voice" content={char.voice} />
        <Section title="Notes" content={char.notes} />
      </div>
    </div>
  );
}
