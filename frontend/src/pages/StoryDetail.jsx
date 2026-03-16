import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './StoryDetail.module.css';

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then(r => r.json())
      .then(setStory);
  }, [id]);

  if (!story) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <Link to="/stories" className={styles.back}>← Back to Stories</Link>
      <h1 className={styles.title}>{story.title}</h1>
      {story.summary && <p className={styles.summary}>{story.summary}</p>}
      <div className={styles.scenes}>
        {story.scenes && story.scenes.length > 0 ? (
          story.scenes.map(scene => (
            <div key={scene.id} className={styles.scene}>
              <div className={styles.sceneHeader}>
                <span className={styles.sceneNumber}>Scene {scene.scene_number}</span>
                {scene.characters_involved && (
                  <span className={styles.chars}>with {scene.characters_involved}</span>
                )}
              </div>
              <p className={styles.sceneContent}>{scene.content}</p>
            </div>
          ))
        ) : (
          <div className={styles.empty}>No scenes recorded yet.</div>
        )}
      </div>
    </div>
  );
}
