import { gradeFreeResponse } from '../src/llm/grader';
import { deepSeekChat } from '../src/llm/deepseek';

jest.mock('../src/llm/deepseek', () => ({
  deepSeekChat: jest.fn(),
}));

const mockChat = deepSeekChat as jest.Mock;

beforeEach(() => {
  mockChat.mockReset();
});

test('majority vote returns final verdict', async () => {
  mockChat
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"correct"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"incorrect"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"correct"}' } }],
    });

  const res = await gradeFreeResponse('Q', 'A');
  expect(res.verdict).toBe('correct');
  expect(res.score).toBe(1);
  expect(res.modelVotes).toEqual(['correct', 'incorrect', 'correct']);
  expect(mockChat).toHaveBeenCalledTimes(3);
});

test('unsure triggers escalate', async () => {
  mockChat
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"partial"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"unsure"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"incorrect"}' } }],
    });

  const res = await gradeFreeResponse('Q', 'A');
  expect(res.verdict).toBe('escalate');
  expect(res.score).toBeNull();
});

test('majority partial returns score 0.6', async () => {
  mockChat
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"partial"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"partial"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"incorrect"}' } }],
    });

  const res = await gradeFreeResponse('Q', 'A');
  expect(res.verdict).toBe('partial');
  expect(res.score).toBe(0.6);
  expect(res.modelVotes).toEqual(['partial', 'partial', 'incorrect']);
});

test('all different verdicts escalate', async () => {
  mockChat
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"correct"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"partial"}' } }],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '{"verdict":"incorrect"}' } }],
    });

  const res = await gradeFreeResponse('Q', 'A');
  expect(res.verdict).toBe('escalate');
  expect(res.score).toBeNull();
});

test('invalid JSON defaults to incorrect', async () => {
  mockChat.mockResolvedValue({ choices: [{ message: { content: 'oops' } }] });
  const res = await gradeFreeResponse('Q', 'A');
  expect(res.verdict).toBe('incorrect');
  expect(res.score).toBe(0);
});
