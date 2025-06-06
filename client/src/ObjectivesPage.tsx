import React, { useState } from 'react';
import { apiFetch } from './api';

interface Extracted { text: string }

export function ObjectivesPage() {
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void extract();
    }
  };

  const extract = async () => {
    if (!text.trim() || !course.trim()) return;
    console.log('Sending objective extraction request');
    setLoading(true);
    try {
      const res = await apiFetch('/api/objectives/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, text }),
      });
      if (!res.ok) throw new Error('server_error');
      const data = await res.json();
      console.log('Objectives received:', data.objectives);
      setObjectives(data.objectives.map((o: Extracted) => o.text));
    } catch (err) {
      console.error('Failed to load objectives', err);
      alert('Failed to load objectives');
    } finally {
      setLoading(false);
      console.log('Request complete');
    }
  };

  return (
    <div>
      <h2>Objective Extractor</h2>
      <input
        placeholder="Course Title"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <textarea
        placeholder="Paste text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={extract} disabled={loading}>
        {loading ? 'Loading...' : 'Extract'}
      </button>
      <textarea
        readOnly
        placeholder="Objectives will appear here"
        value={objectives.join('\n')}
      />
    </div>
  );
}
