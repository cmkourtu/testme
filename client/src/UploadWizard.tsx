import React, { useState } from 'react';
import { apiFetch } from './api';

export function UploadWizard() {
  const [step, setStep] = useState(1);
  interface Extracted { text: string }

  const [fileText, setFileText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [title, setTitle] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [uploadId, setUploadId] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setFileText(text);
    const res = await apiFetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setUploadId(data.upload_id);
    setStep(2);
  };

  const handleText = async () => {
    if (!typedText.trim()) return;
    setFileText(typedText);
    const res = await apiFetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: typedText }),
    });
    const data = await res.json();
    setUploadId(data.upload_id);
    setStep(2);
  };

  const extractObjectives = async () => {
    const res = await apiFetch('/api/objectives/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: title, text: fileText }),
    });
    const data = await res.json();
    setObjectives(data.objectives.map((o: Extracted) => o.text));
  };

  const saveCourse = async () => {
    await apiFetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, uploadId }),
    });
    setStep(1);
    setFileText('');
    setTypedText('');
    setObjectives([]);
    setTitle('');
    alert('Saved');
  };

  if (step === 1) {
    return (
      <div key="upload">
        <h2>Upload File or Paste Text</h2>
        <input type="file" onChange={handleFile} />
        <textarea
          placeholder="Paste text here"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
        />
        <button onClick={handleText}>Use Text</button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div key="edit">
        <h2>Edit Objectives</h2>
        <input
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={extractObjectives}>Load</button>
        <ul>
          {objectives.map((obj, i) => (
            <li key={i}>
              <input
                value={obj}
                onChange={(e) => {
                  const copy = [...objectives];
                  copy[i] = e.target.value;
                  setObjectives(copy);
                }}
              />
            </li>
          ))}
        </ul>
        <button onClick={() => setStep(3)}>Next</button>
      </div>
    );
  }

  return (
    <div key="confirm">
      <h2>Confirm</h2>
      <p>Title: {title}</p>
      <ul>
        {objectives.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
      <button onClick={saveCourse}>Save</button>
    </div>
  );
}
