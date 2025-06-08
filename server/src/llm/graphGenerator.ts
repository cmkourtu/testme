import { deepSeekChat } from './deepseek';
import { dependencyGraphSystem, dependencyGraphUser } from './prompts/dependencyGraph';
import { ExtractedObjective } from '../objectives';

export interface ClusterGraph {
  [cluster: string]: string[];
}

function parse(content: string): ClusterGraph {
  const trimmed = content.trim();
  // allow the LLM to wrap JSON in markdown or add text before/after
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? trimmed;
  const match = fenced.match(/\{[\s\S]*\}/);
  const json = match ? match[0] : fenced;
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new Error('invalid JSON');
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('invalid graph');
  }
  for (const v of Object.values(obj)) {
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
      throw new Error('invalid graph');
    }
  }
  return obj as ClusterGraph;
}

export async function generateClusterGraph(
  objectives: ExtractedObjective[],
): Promise<ClusterGraph> {
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: dependencyGraphSystem },
      { role: 'user', content: dependencyGraphUser(objectives) },
    ],
    temperature: 0,
  };

  const res = await deepSeekChat(body);
  const content = res.choices?.[0]?.message?.content ?? '{}';
  return parse(content);
}
