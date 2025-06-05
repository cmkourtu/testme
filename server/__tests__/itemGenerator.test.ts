import { generateItem, generateTieredItems } from '../src/llm/itemGenerator';
import { deepSeekChat } from '../src/llm/deepseek';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn()
}));

const mockChat = deepSeekChat as jest.Mock;

beforeEach(() => {
  mockChat.mockReset();
});

test('generateItem parses LLM response', async () => {
  mockChat.mockResolvedValue({
    choices: [
      { message: { content: '{"stem":"Q1","reference":"A1","bloom":"Remember","tier":1,"explanation":"E1"}' } }
    ]
  });

  const item = await generateItem({
    objective: 'Define X',
    bloom: 'Remember',
    tier: 1,
    context: 'text',
    previous: []
  });

  expect(item.stem).toBe('Q1');
  expect(mockChat).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: [
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: expect.stringContaining('Objective: Define X') }
      ]
    })
  );
});

test('generateTieredItems requests three tiers', async () => {
  mockChat
    .mockResolvedValueOnce({
      choices: [
        { message: { content: '{"stem":"Q1","reference":"A1","bloom":"Remember","tier":1,"explanation":"E1"}' } }
      ]
    })
    .mockResolvedValueOnce({
      choices: [
        { message: { content: '{"stem":"Q3","reference":"A3","bloom":"Apply","tier":3,"explanation":"E3"}' } }
      ]
    })
    .mockResolvedValueOnce({
      choices: [
        { message: { content: '{"stem":"Q5","reference":"A5","bloom":"Evaluate","tier":5,"explanation":"E5"}' } }
      ]
    });

  const items = await generateTieredItems('Sample', 'ctx', ['Remember', 'Apply', 'Evaluate']);
  expect(items).toHaveLength(3);
  expect(items.map((i) => i.tier)).toEqual([1, 3, 5]);
  expect(mockChat).toHaveBeenCalledTimes(3);
});
