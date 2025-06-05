/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PracticeView } from '../src/PracticeView';
import * as api from '../src/api';

jest.mock('../src/api');
const mockNext = api.fetchNextItem as jest.Mock;
const mockSubmit = api.submitAnswer as jest.Mock;

beforeEach(() => {
  mockNext.mockResolvedValue({ id: 1, stem: 'Q1' });
  mockSubmit.mockResolvedValue({ verdict: 'correct', feedback: 'good' });
});

test('loads and submits item', async () => {
  const { getByText, getByRole } = render(<PracticeView />);
  await waitFor(() => getByText('Q1'));

  fireEvent.change(getByRole('textbox'), { target: { value: 'A' } });
  fireEvent.click(getByText('Submit'));

  await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith(1, 'A'));
  await waitFor(() => expect(mockNext).toHaveBeenCalledTimes(2));
  await waitFor(() => getByRole('alert'));
});
