import { generateClusterGraph } from '../src/llm/graphGenerator';
import { deepSeekChat } from '../src/llm/deepseek';
import { ExtractedObjective } from '../src/objectives';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn(),
}));

const mockChat = deepSeekChat as jest.Mock;
const objectives: ExtractedObjective[] = [
  { id: 'A1', text: 'Define X', bloom: 'Remember', cluster: 'Intro' },
];

beforeEach(() => {
  mockChat.mockReset();
});

test('throws when parsed JSON is not an object', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: '[]' } }] });
  await expect(generateClusterGraph(objectives)).rejects.toThrow('invalid graph');
});

test('throws when cluster values are not arrays of strings', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: '{"Intro":[1]}' } }] });
  await expect(generateClusterGraph(objectives)).rejects.toThrow('invalid graph');
});
