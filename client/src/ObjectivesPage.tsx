import React, { useState } from 'react';
import { apiFetch } from './api';

interface Extracted { text: string }

export function ObjectivesPage() {
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const extract = async () => {
    if (!text.trim() || !course.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/objectives/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, text }),
      });
      if (!res.ok) throw new Error('server_error');
      const data = await res.json();
      setObjectives(data.objectives.map((o: Extracted) => o.text));
    } catch {
      alert('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Objective Extractor</h2>
      <input
        placeholder="Course Title"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />
      <textarea
        placeholder="Paste text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={extract} disabled={loading}>
        {loading ? 'Loading...' : 'Extract'}
      </button>
      <ul>
        {objectives.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </div>
  );
}
