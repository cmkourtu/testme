import { deepSeekChat } from './deepseek';
import {
  freeResponseGraderPrompt,
  freeResponseGraderUser,
} from './prompts/freeResponseGrader';

export type ModelVerdict = 'correct' | 'partial' | 'incorrect' | 'blank' | 'escalate';
export type Verdict = 'correct' | 'partial' | 'incorrect' | 'blank' | 'escalate';
export interface GradeResult {
  verdict: Verdict;
  score: number | null;
  modelVotes: ModelVerdict[];
  feedback?: string;
  explanation?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reference?: any;
}

function parse(content: string) {
  const trimmed = content.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const json = match ? match[1].trim() : trimmed;
  try {
    return JSON.parse(json) as {
      verdict?: ModelVerdict;
      feedback?: string;
      explanation?: string;
      reference?: unknown;
    };
  } catch {
    return {};
  }
}

export async function gradeFreeResponse(
  stem: string,
  reference: string,
  answer: string,
  bloom: string = 'Remember',
): Promise<GradeResult> {
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: freeResponseGraderPrompt },
      { role: 'user', content: freeResponseGraderUser(stem, reference, answer, bloom) },
    ],
    temperature: 0,
  };

  const results = await Promise.all([
    deepSeekChat(body),
    deepSeekChat(body),
    deepSeekChat(body),
  ]);

  const parsed = results.map((r) => {
    const text = r.choices?.[0]?.message?.content ?? '{}';
    return parse(text);
  });

  const votes = parsed.map((p) => p.verdict ?? 'incorrect') as ModelVerdict[];

  if (votes.includes('escalate')) {
    return { verdict: 'escalate', score: null, modelVotes: votes };
  }

  const counts: Record<string, number> = {};
  for (const v of votes) counts[v] = (counts[v] ?? 0) + 1;

  const majorityVerdict = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!majorityVerdict || majorityVerdict[1] < 2) {
    return { verdict: 'escalate', score: null, modelVotes: votes };
  }

  const finalVerdict = majorityVerdict[0] as Verdict;
  const firstMajority = parsed[votes.indexOf(finalVerdict as ModelVerdict)];
  let score: number | null = null;
  if (finalVerdict === 'correct') score = 1.0;
  else if (finalVerdict === 'partial') score = 0.6;
  else if (finalVerdict === 'incorrect' || finalVerdict === 'blank') score = 0.0;

  return {
    verdict: finalVerdict,
    score,
    modelVotes: votes,
    feedback: firstMajority?.feedback,
    explanation: firstMajority?.explanation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reference: firstMajority?.reference as any,
  };
}
