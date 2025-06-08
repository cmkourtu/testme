export const itemGeneratorSystem = `You are an assessment-item generator.
Return a **single JSON object** with these keys:
  "stem"        : string   # ≤ 30 words, no numbering
  "reference"   : string   # canonical answer or rubric bullets
  "bloom"       : string   # Bloom level used
  "tier"        : integer  # 1 = easy, 3 = core, 5 = stretch
  "explanation" : string   # ≤ 40 words, model answer rationale

Constraints:
- Free-response only (NO multiple-choice options).
- Do NOT reveal the rubric in the stem.
- Avoid duplicating any prior stems supplied.
- Use notation consistent with the context.
- JSON only, no markdown fences.`;

export const itemGeneratorUser = (
  objective: string,
  bloom: string,
  tier: number,
  context: string,
  prior: string[],
) => `Objective: ${objective}
Requested Bloom level: ${bloom}
Difficulty tier: ${tier}

Chapter context (≤ 400 tokens, for jargon alignment):
"""
${context}
"""

Previously served stems to this learner:
${prior.join('\n')}

Generate the assessment item now.`;
