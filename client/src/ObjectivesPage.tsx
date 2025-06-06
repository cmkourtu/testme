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
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold">Objective Extractor</h2>
      </header>
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <input
          className="w-full border border-gray-300 rounded-xl p-2 focus:ring"
          placeholder="Course Title"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <textarea
          className="w-full border border-gray-300 rounded-xl p-2 h-40 focus:ring"
          placeholder="Paste text here"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-indigo-500 hover:bg-purple-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          onClick={extract}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Extract'}
        </button>
        <div className="space-y-2">
          {objectives.map((obj, i) => (
            <div
              key={i}
              className="prose text-gray-700 shadow-sm rounded-2xl p-3"
            >
              {obj}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
