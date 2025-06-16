import React, { useEffect, useState } from 'react';
import { fetchNextItem, submitAnswer } from './api';

interface Item {
  id: number;
  stem: string;
}

export function PracticeView() {
  const [item, setItem] = useState<Item | null>(null);
  const [answer, setAnswer] = useState('');
  const [toast, setToast] = useState('');

  const loadItem = async () => {
    const res = await fetchNextItem();
    setItem(res.item);
    setAnswer('');
  };

  useEffect(() => {
    loadItem();
  }, []);

  const handleSubmit = async () => {
    if (!item) return;
    const res = await submitAnswer(item.id, answer);
    setToast(res.verdict + (res.feedback ? `: ${res.feedback}` : ''));
    setTimeout(() => setToast(''), 2000);
    await loadItem();
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h2>{item.stem}</h2>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      {toast && <div role="alert">{toast}</div>}
    </div>
  );
}
