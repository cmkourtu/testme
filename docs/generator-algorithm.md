# Generator Algorithm

This document outlines how learning items are automatically generated from a given objective. The algorithm combines structured prompts with LLM responses to create a progression of questions across difficulty tiers.

## Goals
- Produce at least three tiers of items for each learning objective.
- Follow Bloom's taxonomy verbs to ensure higher tiers demand deeper understanding.
- Avoid duplicate stems and answers when regenerating content.

## Pipeline
1. **Preprocessing**
   - Normalize the objective text and extract key nouns and verbs.
   - Determine the Bloom verb sequence, e.g. *remember → understand → apply*.
2. **Prompt Construction**
   - A system prompt sets the desired format and instructs the model to output JSON with fields `stem`, `answer`, and `tier`.
   - The user prompt includes the cleaned objective, an example item, and the requested tier count.
3. **LLM Generation**
   - The `deepSeekChat` helper in `server/src/llm/deepseek.ts` sends the prompts to the DeepSeek API with retry logic and rate limiting.
   - The response is parsed and validated against a schema; invalid entries trigger a single retry.
4. **Post‑processing**
   - Items are deduplicated by hashing the `stem` and checking for collisions in the database.
   - Answers are normalized to reduce false duplicates (e.g. lowercasing, trimming punctuation).
   - Each item is assigned a numeric `tier` (1 = easiest) and stored in the `items` table.

## Example Output
```json
[
  { "tier": 1, "stem": "Define a binary tree", "answer": "A tree where each node has at most two children." },
  { "tier": 2, "stem": "Explain how an inorder traversal works", "answer": "Visit left subtree, then node, then right subtree." },
  { "tier": 3, "stem": "Given this tree, show the result of an inorder traversal", "answer": "[B, D, E, A, F, C]" }
]
```
The generator aims for concise stems and single-sentence answers so that evaluation by the scheduler remains straightforward.

## Error Handling
- Network failures during the API call are retried up to two times using the limiter in `deepSeekChat`.
- If the returned JSON cannot be parsed, the prompt is appended with a clarification request and sent once more.
- When duplicates are detected after insertion, the extras are discarded and logged.

By automating question creation in this way, instructors can rapidly seed a course with tiered practice items while maintaining consistency across objectives.
