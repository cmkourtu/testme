import { generateClusterGraph } from '../src/llm/graphGenerator';
import { deepSeekChat } from '../src/llm/deepseek';
import { ExtractedObjective } from '../src/objectives';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn()
}));

const mockChat = deepSeekChat as jest.Mock;

const objectives: ExtractedObjective[] = [
  { id: 'A1', text: 'Define X', bloom: 'Remember', cluster: 'Intro' },
  { id: 'B1', text: 'Use X', bloom: 'Apply', cluster: 'Advanced' }
];

beforeEach(() => {
  mockChat.mockReset();
});

test('parses graph JSON', async () => {
  mockChat.mockResolvedValue({
    choices: [
      { message: { content: '{"Intro":[],"Advanced":["Intro"]}' } }
    ]
  });
  const g = await generateClusterGraph(objectives);
  expect(g.Advanced[0]).toBe('Intro');
  expect(mockChat).toHaveBeenCalled();
});

test('invalid JSON throws', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: 'bad' } }] });
  await expect(generateClusterGraph(objectives)).rejects.toThrow('invalid JSON');
});

test('parses graph with extra text', async () => {
  mockChat.mockResolvedValue({
    choices: [
      { message: { content: 'Here it is:\n```json\n{"Intro":[]}\n``` done' } }
    ]
  });
  const g = await generateClusterGraph(objectives);
  expect(g.Intro).toEqual([]);
});
