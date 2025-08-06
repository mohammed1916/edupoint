"use client";
import React, { useState } from 'react';
import styles from '../styles/ragUploader.module.css';

const RagUploader: React.FC = () => {
  const [tasks, setTasks] = useState('');
  const [events, setEvents] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    setStatus('Uploading...');
    const texts = [];
    if (tasks.trim()) texts.push('Tasks: ' + tasks);
    if (events.trim()) texts.push('Events: ' + events);
    try {
      const res = await fetch('http://localhost:8000/api/rag/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });
      const data = await res.json();
      setStatus(`Uploaded ${data.chunks} chunks.`);
    } catch (e) {
      setStatus('Upload failed.');
    }
  };

  return (
    <div className={styles.ragUploader}>
      <h4>Upload Tasks & Events for RAG</h4>
      <textarea
        rows={4}
        placeholder="Paste tasks here (one per line or as text)"
        value={tasks}
        onChange={e => setTasks(e.target.value)}
        className={styles.textarea}
      />
      <textarea
        rows={4}
        placeholder="Paste events here (one per line or as text)"
        value={events}
        onChange={e => setEvents(e.target.value)}
        className={styles.textarea}
      />
      <button onClick={handleUpload} className={styles.button}>Upload to RAG</button>
      <div className={styles.status}>{status}</div>
    </div>
  );
};

export default RagUploader;
