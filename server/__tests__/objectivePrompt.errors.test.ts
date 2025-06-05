import { extractObjectives } from '../src/objectives';
import { deepSeekChat } from '../src/llm/deepseek';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn()
}));

const mockChat = deepSeekChat as jest.Mock;

beforeEach(() => {
  mockChat.mockReset();
});

test('invalid JSON throws', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: 'not-json' } }] });
  await expect(extractObjectives('Course', 'text')).rejects.toThrow('invalid JSON');
});

test('non-array response throws', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: '{}' } }] });
  await expect(extractObjectives('C', 't')).rejects.toThrow('invalid response');
});

test('invalid objective throws', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: '[{"id":1}]' } }] });
  await expect(extractObjectives('C', 't')).rejects.toThrow('invalid objective');
});
