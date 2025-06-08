import { extractObjectives, ExtractedObjective } from '../src/objectives';
import { deepSeekChat } from '../src/llm/deepseek';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn(),
}));

const mockChat = deepSeekChat as jest.Mock;

beforeEach(() => {
  mockChat.mockReset();
});

test('parses objects from code block', async () => {
  const obj: ExtractedObjective = {
    id: 'A-1',
    text: 'Define demo',
    bloom: 'Remember',
    cluster: 'Intro',
  };
  mockChat.mockResolvedValue({
    choices: [{ message: { content: '```json\n[' + JSON.stringify(obj) + ']\n```' } }],
  });
  const list = await extractObjectives('Demo', 'text');
  expect(list).toEqual([obj]);
  expect(mockChat).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: [
        { role: 'system', content: expect.any(String) },
        { role: 'user', content: expect.stringContaining('Course: Demo') },
      ],
    }),
  );
});
