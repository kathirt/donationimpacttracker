import axios from 'axios';
import { impactApi } from './api';
import { FilterOptions } from '../types';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
  }))
}));

const client = (axios.create as jest.Mock).mock.results[0].value;

beforeEach(() => client.get.mockReset());

test.each([
  [undefined, '/impact-summary?'],
  [{}, '/impact-summary?'],
  [{ region: 'North America' }, '/impact-summary?region=North+America']
])('requests the Azure Function summary route with filters %p', async (filters, url) => {
  const summary = { totalAmount: 100 };
  client.get.mockResolvedValue({ data: summary });
  expect(await impactApi.getImpactSummary(filters)).toBe(summary);
  expect(client.get).toHaveBeenCalledWith(url);
});

test.each<FilterOptions>([
  { donor: 'john-doe' },
  { campaign: 'scholarship-fund' },
  { impactType: 'meals_served' },
  { dateRange: { start: '2024-01-01', end: '2024-12-31' } }
])('rejects unsupported summary filters %p before requesting data', async filters => {
  await expect(impactApi.getImpactSummary(filters)).rejects.toThrow('region filtering only');
  expect(client.get).not.toHaveBeenCalled();
});

test('propagates API errors to the dashboard', async () => {
  client.get.mockRejectedValue(new Error('Network unavailable'));
  await expect(impactApi.getImpactSummary()).rejects.toThrow('Network unavailable');
});
