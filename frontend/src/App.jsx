import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import Settings from './pages/Settings';
import Scenarios from './pages/Scenarios';
import Launch from './pages/Launch';
import styles from './App.module.css';

const navItems = [
  { to: '/characters', emoji: '👤', label: 'Characters' },
  { to: '/stories', emoji: '📖', label: 'Stories' },
  { to: '/settings', emoji: '🗺️', label: 'Settings' },
  { to: '/scenarios', emoji: '🎭', label: 'Scenarios' },
  { to: '/launch', emoji: '▶️', label: 'Launch' },
];

export default function App() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Andy</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                styles.navItem + (isActive ? ' ' + styles.active : '')
              }
            >
              {item.emoji} {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Characters />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/launch" element={<Launch />} />
        </Routes>
      </main>
    </div>
  );
}
