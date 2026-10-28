import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { Dashboard } from './Dashboard';
import { impactApi } from '../services/api';
import { ImpactSummary } from '../types';

jest.mock('../services/api', () => ({ impactApi: { getImpactSummary: jest.fn() } }));
jest.mock('./ImpactMetrics', () => ({
  ImpactMetrics: ({ summary }: { summary: ImpactSummary }) => <div data-testid="metrics">{JSON.stringify(summary)}</div>
}));
jest.mock('./ImpactChart', () => ({
  ImpactChart: ({ summary }: { summary: ImpactSummary }) => <div data-testid="charts">{JSON.stringify(summary)}</div>
}));
jest.mock('./ImpactNarrative', () => ({ ImpactNarrative: () => null }));
jest.mock('./RecentActivities', () => ({ RecentActivities: () => null }));

const summary = (amount: number): ImpactSummary => ({
  totalAmount: amount, totalDonations: 1, totalBeneficiaries: 2,
  impactsByType: { meals_served: { total: amount, description: 'Meals' } },
  regionBreakdown: { Europe: { donations: 1, amount, beneficiaries: 2 } }
});
const getSummary = impactApi.getImpactSummary as jest.Mock;
let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  getSummary.mockReset();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function renderDashboard() {
  await act(async () => { root.render(<Dashboard />); });
}

async function selectRegion(region: string) {
  await act(async () => {
    const select = container.querySelector('#region-filter') as HTMLSelectElement;
    select.value = region;
    Simulate.change(select);
  });
}

function expectSummary(expected: ImpactSummary) {
  expect(container.querySelector('[data-testid="metrics"]')?.textContent).toBe(JSON.stringify(expected));
  expect(container.querySelector('[data-testid="charts"]')?.textContent).toBe(JSON.stringify(expected));
}

test('loads global data, updates metrics and charts for a region, and clears filters', async () => {
  getSummary.mockResolvedValueOnce(summary(100)).mockResolvedValueOnce(summary(40)).mockResolvedValueOnce(summary(100));
  await renderDashboard();
  expect(getSummary).toHaveBeenLastCalledWith({});
  expectSummary(summary(100));
  await selectRegion('Europe');
  expect(getSummary).toHaveBeenLastCalledWith({ region: 'Europe' });
  expectSummary(summary(40));
  await act(async () => {
    Simulate.click(container.querySelector('.clear-filters-btn')!);
  });
  expect(getSummary).toHaveBeenLastCalledWith({});
  expect((container.querySelector('#region-filter') as HTMLSelectElement).value).toBe('');
  expectSummary(summary(100));
});

test('unsupported filters are disabled and explained', async () => {
  getSummary.mockResolvedValue(summary(100));
  await renderDashboard();
  for (const id of ['donor-filter', 'campaign-filter', 'impact-type-filter']) {
    expect((container.querySelector(`#${id}`) as HTMLSelectElement).disabled).toBe(true);
  }
  expect(container.textContent).toContain('Summary filtering supports region only');
});

test('loading keeps filters available and ignores outdated responses', async () => {
  let resolveInitial!: (data: ImpactSummary) => void;
  getSummary.mockImplementationOnce(() => new Promise(resolve => { resolveInitial = resolve; }))
    .mockResolvedValueOnce(summary(40));
  await renderDashboard();
  expect(container.querySelector('[role="status"]')?.textContent).toContain('Loading');
  expect(container.querySelector('#region-filter')).not.toBeNull();
  await selectRegion('Europe');
  expectSummary(summary(40));
  await act(async () => { resolveInitial(summary(100)); });
  expectSummary(summary(40));
});

test('failed region refresh hides stale data and retry retains the selected filter', async () => {
  getSummary.mockResolvedValueOnce(summary(100)).mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(summary(40));
  await renderDashboard();
  await selectRegion('Europe');
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Failed to load');
  expect(container.querySelector('[data-testid="metrics"]')).toBeNull();
  expect((container.querySelector('#region-filter') as HTMLSelectElement).value).toBe('Europe');
  await act(async () => { Simulate.click(container.querySelector('[role="alert"] button')!); });
  expect(getSummary).toHaveBeenLastCalledWith({ region: 'Europe' });
  expectSummary(summary(40));
});

test('initial API failures can be retried', async () => {
  getSummary.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(summary(100));
  await renderDashboard();
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  await act(async () => { Simulate.click(container.querySelector('[role="alert"] button')!); });
  expectSummary(summary(100));
});
