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
  const [result, setResult] = useState<{ verdict: string; feedback?: string } | null>(
    null,
  );
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
    setResult({ verdict: res.verdict, feedback: res.feedback });
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      submit();
    }
  };

  if (tier === null) {
    return (
      <div className="practice-container">
        <header className="practice-header">
          <button className="practice-back-button" onClick={onBack}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="practice-title-section">
            <h1 className="practice-title">Practice Mode</h1>
            <p className="practice-subtitle">Test your understanding</p>
          </div>
        </header>

        <div className="practice-content">
          <div className="practice-objective-display">
            <h2 className="practice-objective-label">Learning Objective</h2>
            <p className="practice-objective-text">{objective}</p>
          </div>

          <div className="difficulty-selection">
            <h3 className="difficulty-title">Select Difficulty Level</h3>
            <p className="difficulty-description">
              Choose how challenging you want the practice question to be
            </p>

            <div className="difficulty-options">
              {[
                {
                  tier: 1,
                  name: 'Basic',
                  description: 'Fundamental concepts and recall',
                },
                {
                  tier: 3,
                  name: 'Intermediate',
                  description: 'Application and analysis',
                },
                { tier: 5, name: 'Advanced', description: 'Synthesis and evaluation' },
              ].map(({ tier: t, name, description }) => (
                <button
                  key={t}
                  className={`difficulty-card ${loading ? 'disabled' : ''}`}
                  onClick={() => start(t)}
                  disabled={loading}
                >
                  <div className="difficulty-tier">Tier {t}</div>
                  <div className="difficulty-name">{name}</div>
                  <div className="difficulty-desc">{description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container">
      <header className="practice-header">
        <button className="practice-back-button" onClick={onBack}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="practice-title-section">
          <h1 className="practice-title">Practice Question</h1>
          <p className="practice-subtitle">Tier {tier} Difficulty</p>
        </div>
      </header>

      <div className="practice-question-content">
        <div className="question-section">
          <div className="question-prompt">
            <h3 className="question-label">Question</h3>
            <p className="question-text">{stem}</p>
          </div>

          <div className="answer-section">
            <label className="answer-label">Your Answer</label>
            <textarea
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              rows={6}
              disabled={loading}
            />

            <button
              className={`submit-button ${loading || !answer.trim() ? 'disabled' : ''}`}
              onClick={submit}
              disabled={loading || !answer.trim()}
            >
              {loading ? (
                <>
                  <div className="practice-spinner"></div>
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`result-section ${
                result.verdict === 'correct'
                  ? 'correct'
                  : result.verdict === 'partial'
                    ? 'partial'
                    : 'incorrect'
              }`}
            >
              <div className="result-icon">
                {result.verdict === 'correct' ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : result.verdict === 'partial' ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="result-content">
                <p className="result-verdict">
                  {result.verdict === 'correct'
                    ? 'Correct!'
                    : result.verdict === 'partial'
                      ? 'Partially Correct'
                      : result.verdict === 'incorrect'
                        ? 'Incorrect'
                        : result.verdict === 'blank'
                          ? 'No Answer Provided'
                          : 'Review Required'}
                </p>
                {result.feedback && <p className="result-feedback">{result.feedback}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
