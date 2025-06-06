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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Objective Extractor</h2>
      <input
        className="w-full border rounded p-2"
        placeholder="Course Title"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <textarea
        className="w-full border rounded p-2 h-40"
        placeholder="Paste text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={extract}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Extract'}
      </button>
      <textarea
        className="w-full border rounded p-2 h-40"
        readOnly
        placeholder="Objectives will appear here"
        value={objectives.join('\n')}
      />
    </div>
  );
}
