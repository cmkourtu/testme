import React, { useState } from 'react';
import { apiFetch } from './api';
import './chatgpt-theme.css';

interface Extracted { text: string }

export function ObjectivesPage() {
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [graph, setGraph] = useState<Record<string, string[]>>({});
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
      setGraph(data.graph ?? {});
      setText(''); // Clear input after successful extraction
    } catch (err) {
      console.error('Failed to load objectives', err);
      alert('Failed to load objectives');
    } finally {
      setLoading(false);
      console.log('Request complete');
    }
  };

  const isDisabled = loading || !text.trim() || !course.trim();

  return (
    <div className="builder-container">
      {/* Header */}
      <header className="builder-header">
        <div className="builder-title-section">
          <button className="builder-back-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="builder-title">New Course</h1>
            <div className="builder-draft">
              <span>●</span> Draft
            </div>
          </div>
        </div>
        <button className="builder-create-button">Create</button>
      </header>

      {/* Main Content */}
      <div className="builder-content">
        {/* Left Panel - Create */}
        <div className="builder-left-panel">
          <div className="builder-tabs">
            <button className="builder-tab active">Create</button>
            <button className="builder-tab">Configure</button>
          </div>

          <div className="builder-input-section">
            <p className="builder-helper-text">
              Hi! I'll help you extract learning objectives from your course material. 
              First, enter your course title below, then paste your course content in the bottom input.
            </p>
            
            <p className="builder-question">What's the name of your course?</p>
            
            <div className="builder-input-area">
              <input
                className="builder-input"
                placeholder="Course Title (e.g., Introduction to Computer Science)"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
              
              {course && (
                <div style={{ marginTop: '24px' }}>
                  <p className="builder-helper-text">
                    Great! Now paste your course material in the input below and press Enter to extract objectives.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="builder-bottom-input">
            <div className="builder-input-wrapper">
              <input
                type="text"
                className="builder-bottom-text"
                placeholder="What do you want to learn?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="builder-send-button" 
                disabled={isDisabled}
                onClick={extract}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="builder-right-panel">
          <div className="builder-preview-header">Preview</div>
          
          <div className="builder-preview-content">
            {objectives.length === 0 && !loading && (
              <div className="builder-empty-preview">
                <div className="builder-empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p>Objectives will appear here</p>
              </div>
            )}

            {loading && (
              <div className="builder-loading">
                <div className="builder-spinner"></div>
                <p>Extracting objectives...</p>
              </div>
            )}

            {objectives.length > 0 && (
              <div className="builder-objectives-container">
                <div className="builder-objectives-list">
                  {objectives.map((obj, i) => (
                    <div key={i} className="builder-objective">
                      <div className="builder-objective-number">{i + 1}</div>
                      <p className="builder-objective-text">{obj}</p>
                    </div>
                  ))}
                </div>
                {Object.keys(graph).length > 0 && (
                  <div className="builder-graph">
                    <h3>Dependency Diagram</h3>
                    <ul>
                      {Object.entries(graph).map(([cluster, deps]) => (
                        <li key={cluster}>
                          {cluster}: {deps.length ? deps.join(', ') : 'none'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
