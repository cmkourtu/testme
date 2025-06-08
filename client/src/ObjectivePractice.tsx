import React, { useState } from 'react';
import { generatePracticeItem, gradePracticeAnswer } from './api';

interface Props {
  objective: string;
  onBack: () => void;
}

export function ObjectivePractice({ objective, onBack }: Props) {
  const [tier, setTier] = useState<number | null>(null);
  const [stem, setStem] = useState('');
  const [reference, setReference] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const start = async (t: number) => {
    setLoading(true);
    const item = await generatePracticeItem(objective, t);
    setStem(item.stem);
    setReference(item.reference);
    setTier(t);
    setLoading(false);
  };

  const submit = async () => {
    setLoading(true);
    const res = await gradePracticeAnswer(stem, reference, answer);
    setResult(res.verdict + (res.feedback ? `: ${res.feedback}` : ''));
    setLoading(false);
  };

  if (tier === null) {
    return (
      <div>
        <h2>Select difficulty</h2>
        {[1, 3, 5].map((t) => (
          <button key={t} onClick={() => start(t)} disabled={loading}>
            Tier {t}
          </button>
        ))}
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <p>{stem}</p>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button onClick={submit} disabled={loading}>
        Submit
      </button>
      {result && <div role="alert">{result}</div>}
      <button onClick={onBack}>Back</button>
    </div>
  );
}
