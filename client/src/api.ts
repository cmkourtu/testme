import { initAnonUser } from './auth';

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const user = initAnonUser();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    'X-User': user,
  };
  return fetch(input, { ...init, headers });
}

export async function fetchNextItem() {
  const res = await apiFetch('/api/session/next');
  return res.json();
}

export async function submitAnswer(itemId: number, answer: string) {
  const res = await apiFetch(`/api/session/${itemId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  });
  return res.json();
}

export async function generatePracticeItem(objective: string, tier: number) {
  const res = await apiFetch('/api/practice/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objective, tier }),
  });
  return res.json();
}

export async function gradePracticeAnswer(
  stem: string,
  reference: string,
  answer: string,
) {
  const res = await apiFetch('/api/practice/grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stem, reference, answer }),
  });
  return res.json();
}
