import { deepSeekChat } from './llm/deepseek';

export async function extractObjectives(text: string): Promise<string[]> {
  const system =
    'You are an expert learning designer. Extract a concise list of learning objectives from the provided text. Return only a JSON array of short objectives.';
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: text }
    ],
    temperature: 0
  };

  const res = await deepSeekChat(body);
  const content = res.choices?.[0]?.message?.content ?? '[]';
  let list: unknown = [];
  try {
    list = JSON.parse(content);
  } catch {
    throw new Error('invalid JSON');
  }
  if (!Array.isArray(list)) {
    throw new Error('invalid response');
  }
  return list as string[];
}

