export const freeResponseGraderPrompt = `You are a strict automatic grader.
Return JSON:
{
  "verdict":  "correct|partial|incorrect|blank|escalate",
  "score":    number|null,   # 1.0, 0.6, 0.0, or null for escalate
  "feedback": string         # ≤ 50 words, actionable
}

Rubric:
- correct   → concept and details fully right
- partial   → core idea right, minor error (units, sign, 1-step slip)
- incorrect → key concept wrong or missing
- blank     → empty or "idk" style answer
- escalate  → model unsure, contradictions between votes, or policy hit`;

export function freeResponseGraderUser(
  stem: string,
  reference: string,
  userAnswer: string,
  bloom: string = 'Remember',
): string {
  return `Question stem:
${stem}

Reference answer / rubric:
"""
${reference}
"""

Learner answer:
"""
${userAnswer}
"""

Bloom level: ${bloom}

Grade now.`;
}
