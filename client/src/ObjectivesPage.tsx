import React, { useState } from 'react';
import { apiFetch } from './api';
import './chatgpt-theme.css';

interface ExtractedObjective { 
  id: string;
  text: string;
  cluster: string;
}

// Generate a unique ID for objectives
const generateId = () => `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function ObjectivesPage() {
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [objectives, setObjectives] = useState<ExtractedObjective[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedObjectives, setEditedObjectives] = useState<ExtractedObjective[]>([]);

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
      const newObjectives = data.objectives.map((o: any) => ({
        id: o.id || generateId(),
        text: o.text,
        cluster: o.cluster || 'General'
      }));
      setObjectives(newObjectives);
      setEditedObjectives(newObjectives);
      setText(''); // Clear input after successful extraction
    } catch (err) {
      console.error('Failed to load objectives', err);
      alert('Failed to load objectives');
    } finally {
      setLoading(false);
      console.log('Request complete');
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedObjectives([...objectives]);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedObjectives([...objectives]);
  };

  const saveEdits = () => {
    setObjectives([...editedObjectives]);
    setIsEditing(false);
  };

  const updateObjective = (id: string, field: 'text' | 'cluster', value: string) => {
    const updated = editedObjectives.map(obj => 
      obj.id === id ? { ...obj, [field]: value } : obj
    );
    setEditedObjectives(updated);
  };

  const deleteObjective = (id: string) => {
    const updated = editedObjectives.filter(obj => obj.id !== id);
    setEditedObjectives(updated);
  };

  const addObjective = () => {
    setEditedObjectives([...editedObjectives, { 
      id: generateId(),
      text: '', 
      cluster: 'General' 
    }]);
  };

  // Group objectives by cluster
  const groupObjectivesByCluster = (objs: ExtractedObjective[]) => {
    const grouped: { [cluster: string]: ExtractedObjective[] } = {};
    objs.forEach(obj => {
      if (!grouped[obj.cluster]) {
        grouped[obj.cluster] = [];
      }
      grouped[obj.cluster].push(obj);
    });
    return grouped;
  };

  // Get objective number by ID
  const getObjectiveNumber = (id: string) => {
    const index = displayObjectives.findIndex(obj => obj.id === id);
    return index + 1;
  };

  const isDisabled = loading || !text.trim() || !course.trim();
  const displayObjectives = isEditing ? editedObjectives : objectives;
  const groupedObjectives = groupObjectivesByCluster(displayObjectives);

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
              <textarea
                className="builder-bottom-textarea"
                placeholder="What do you want to learn?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
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

        {/* Right Panel - Objectives by Cluster */}
        <div className="builder-right-panel">
          <div className="builder-preview-header">Objectives by Cluster</div>
          
          <div className="builder-preview-content">
            {objectives.length === 0 && !loading && (
              <div className="builder-empty-preview">
                <div className="builder-empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p>Objectives will appear here grouped by cluster</p>
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
                {Object.entries(groupedObjectives).map(([cluster, clusterObjectives]) => (
                  <div key={`cluster-${cluster}`} className="builder-cluster-group">
                    <h3 className="builder-cluster-title">{cluster}</h3>
                    <div className="builder-objectives-list">
                      {clusterObjectives.map((obj) => (
                        <div key={obj.id} className="builder-objective">
                          <div className="builder-objective-number">{getObjectiveNumber(obj.id)}</div>
                          {isEditing ? (
                            <>
                              <div className="builder-objective-edit-fields">
                                <input
                                  className="builder-objective-input"
                                  value={obj.text}
                                  onChange={(e) => updateObjective(obj.id, 'text', e.target.value)}
                                  placeholder="Enter objective..."
                                />
                                <input
                                  className="builder-cluster-input"
                                  value={obj.cluster}
                                  onChange={(e) => updateObjective(obj.id, 'cluster', e.target.value)}
                                  placeholder="Cluster name..."
                                />
                              </div>
                              <button
                                className="builder-delete-button"
                                onClick={() => deleteObjective(obj.id)}
                                title="Delete objective"
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <p className="builder-objective-text">{obj.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {isEditing && (
                  <button className="builder-add-objective" onClick={addObjective}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add objective</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Edit Button */}
          {objectives.length > 0 && (
            <div className="builder-edit-controls">
              {!isEditing ? (
                <button className="builder-edit-button" onClick={startEditing}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              ) : (
                <>
                  <button className="builder-cancel-button" onClick={cancelEditing}>
                    Cancel
                  </button>
                  <button className="builder-save-button" onClick={saveEdits}>
                    Save
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
