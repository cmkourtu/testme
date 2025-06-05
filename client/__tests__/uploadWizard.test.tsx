/** @jest-environment jsdom */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { UploadWizard } from '../src/UploadWizard';
import * as api from '../src/api';

jest.mock('../src/api');
const mockFetch = api.apiFetch as jest.Mock;

beforeEach(() => {
  mockFetch.mockResolvedValue({ json: async () => ({ upload_id: 'u1' }) });
});

test('step flow', async () => {
  const { container, getByText } = render(<UploadWizard />);
  const fileInput = container.querySelector('input[type=file]') as HTMLInputElement;
  const file = new File(['hello'], 'sample.txt');
  Object.defineProperty(file, 'text', { value: () => Promise.resolve('hello') });
  Object.defineProperty(fileInput, 'files', { value: [file] });
  fireEvent.change(fileInput);
  await waitFor(() => expect(mockFetch).toHaveBeenCalled());
  await waitFor(() => getByText('Edit Objectives'));
});
