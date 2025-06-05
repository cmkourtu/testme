import { initAnonUser } from './auth';

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const user = initAnonUser();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    'X-User': user,
  };
  return fetch(input, { ...init, headers });
}
