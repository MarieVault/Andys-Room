import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './Characters.module.css';

export default function Characters() {
  const [characters, setCharacters] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeTag) params.set('tag', activeTag);
    fetch(`/api/characters?${params}`)
      .then(r => r.json())
      .then(data => { setCharacters(data); setLoading(false); });
  }, [search, activeTag]);

  useEffect(() => {
    fetch('/api/characters/tags').then(r => r.json()).then(setAllTags);
  }, []);

  useEffect(() => { fetchCharacters(); }, [fetchCharacters]);

  const toggleTag = (tag) => setActiveTag(prev => prev === tag ? null : tag);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Characters</h1>
        <span className={styles.count}>{characters.length} in roster</span>
      </div>

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search characters..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className={styles.tagRow}>
          {allTags.map(tag => (
            <button
              key={tag}
              className={styles.tagBtn + (activeTag === tag ? ' ' + styles.tagActive : '')}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : characters.length === 0 ? (
        <div className={styles.empty}>No characters found.</div>
      ) : (
        <div className={styles.grid}>
          {characters.map(c => (
            <Link to={'/characters/' + c.id} key={c.id} className={styles.card}>
              <div className={styles.portrait}>
                {c.portrait_file
                  ? <img src={'/portraits/' + c.portrait_file} alt={c.name} />
                  : <div className={styles.noPortrait}>?</div>
                }
              </div>
              <div className={styles.info}>
                <h2 className={styles.name}>{c.name}</h2>
                <p className={styles.role}>{c.role}</p>
                {c.tags && (
                  <div className={styles.tags}>
                    {c.tags.split(',').slice(0, 3).map(t => (
                      <span key={t} className={styles.tag}>{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
