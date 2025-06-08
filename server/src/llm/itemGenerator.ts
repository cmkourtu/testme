import { deepSeekChat } from './deepseek';
import { itemGeneratorSystem, itemGeneratorUser } from './prompts/itemGenerator';

export interface GeneratedItem {
  stem: string;
  reference: string;
  bloom: string;
  tier: number;
  explanation: string;
}

// Generates a single practice item for Scheduler given Bloom level and tier.
export async function generateItem(params: {
  objective: string;
  bloom: string;
  tier: number;
  context: string;
  previous: string[];
}): Promise<GeneratedItem> {
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: itemGeneratorSystem },
      {
        role: 'user',
        content: itemGeneratorUser(
          params.objective,
          params.bloom,
          params.tier,
          params.context,
          params.previous,
        ),
      },
    ],
    temperature: 0.7,
  };

  const res = await deepSeekChat(body);
  const text = res.choices?.[0]?.message?.content ?? '{}';
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('invalid_response');
  }
  if (!obj || typeof obj !== 'object') {
    throw new Error('invalid_response');
  }
  const o = obj as Record<string, unknown>;
  return {
    stem: String(o.stem || ''),
    reference: String(o.reference || ''),
    bloom: String(o.bloom || ''),
    tier: Number(o.tier || 0),
    explanation: String(o.explanation || ''),
  };
}

export async function generateTieredItems(
  objective: string,
  context: string,
  blooms: string[],
): Promise<GeneratedItem[]> {
  const tiers = [1, 3, 5];
  const prior: string[] = [];
  const items: GeneratedItem[] = [];
  for (let i = 0; i < tiers.length; i++) {
    const item = await generateItem({
      objective,
      bloom: blooms[i] || blooms[0],
      tier: tiers[i],
      context,
      previous: prior,
    });
    prior.push(item.stem);
    items.push(item);
  }
  return items;
}
