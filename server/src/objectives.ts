import { deepSeekChat } from './llm/deepseek';
import {
  objectiveExtractorSystem,
  objectiveExtractorUser,
} from './llm/prompts/objectiveExtractor';

export interface ExtractedObjective {
  id: string;
  text: string;
  bloom: string;
  cluster: string;
}

function parseList(content: string): ExtractedObjective[] {
  const trimmed = content.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const json = match ? match[1].trim() : trimmed;
  let list: unknown;
  try {
    list = JSON.parse(json);
  } catch {
    throw new Error('invalid JSON');
  }
  if (!Array.isArray(list)) {
    throw new Error('invalid response');
  }
  return list.map((obj) => {
    if (!obj || typeof obj !== 'object') {
      throw new Error('invalid objective');
    }
    const o = obj as Record<string, unknown>;
    if (
      typeof o.id !== 'string' ||
      typeof o.text !== 'string' ||
      typeof o.bloom !== 'string' ||
      typeof o.cluster !== 'string'
    ) {
      throw new Error('invalid objective');
    }
    return {
      id: o.id,
      text: o.text,
      bloom: o.bloom,
      cluster: o.cluster,
    } as ExtractedObjective;
  });
}

export async function extractObjectives(
  course: string,
  text: string,
): Promise<ExtractedObjective[]> {
  console.log('Calling LLM for course', course);
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: objectiveExtractorSystem },
      { role: 'user', content: objectiveExtractorUser(course, text) },
    ],
    temperature: 0,
  };

  const res = await deepSeekChat(body);
  console.log('LLM response received');
  const content = res.choices?.[0]?.message?.content ?? '[]';
  const parsed = parseList(content);
  console.log('Parsed', parsed.length, 'objectives');
  return parsed;
}
