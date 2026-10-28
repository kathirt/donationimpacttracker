import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Dashboard } from './Dashboard';
import { AzureOpenAIService } from '../services/openai';
import { mockImpactMetrics } from '../data/mockData';

jest.mock('./ImpactChart', () => ({ ImpactChart: () => null }));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  jest.spyOn(AzureOpenAIService, 'generateImpactSummary').mockResolvedValue('Filtered narrative');
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
});

it('passes the same filtered metrics to the narrative and metric breakdown', async () => {
  await act(async () => root.render(<Dashboard />));
  const changeFilter = async (id: string, value: string) => {
    await act(async () => {
      const select = container.querySelector<HTMLSelectElement>(`#${id}`)!;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };
  await changeFilter('region-filter', 'North America');
  await changeFilter('donor-filter', 'john-doe');
  await changeFilter('campaign-filter', 'school-lunch-program');
  await changeFilter('impact-type-filter', 'meals_served');

  expect(AzureOpenAIService.generateImpactSummary).toHaveBeenLastCalledWith(
    'North America', [mockImpactMetrics[0]], 'sample'
  );
  const breakdown = container.querySelector('.impact-breakdown')!;
  expect(breakdown.textContent).toContain('150');
  expect(breakdown.textContent).toContain('MEALS SERVED');
  expect(breakdown.textContent).not.toContain('BOOKS');
  expect(container.textContent).toContain('Sample data');
  expect(container.querySelector('.metrics-grid')!.textContent).toContain('Unavailable');

  await changeFilter('region-filter', 'Asia');
  expect(container.querySelectorAll('.impact-breakdown .impact-item')).toHaveLength(0);
  expect(container.querySelectorAll('.recent-activities .activity-item')).toHaveLength(0);
  expect(container.querySelector('.narrative-content')!.textContent).toContain('Not enough verified impact data');

  await act(async () => {
    container.querySelector<HTMLButtonElement>('.clear-filters-btn')!.click();
  });
  expect(AzureOpenAIService.generateImpactSummary).toHaveBeenLastCalledWith('global', mockImpactMetrics, 'sample');
  expect(container.querySelectorAll('.impact-breakdown .impact-item')).toHaveLength(5);

  await changeFilter('region-filter', 'Europe');
  expect(container.querySelector('.impact-breakdown')!.textContent).toContain('TABLETS DISTRIBUTED25');
  expect(container.querySelector('.impact-breakdown')!.textContent).toContain('BOOKS DISTRIBUTED15');
  expect(Array.from(container.querySelectorAll('.recent-activities .activity-region'))
    .every(region => region.textContent === 'Europe')).toBe(true);

  await changeFilter('impact-type-filter', 'tablets_distributed');
  expect(AzureOpenAIService.generateImpactSummary).toHaveBeenLastCalledWith('Europe', [mockImpactMetrics[1]], 'sample');
});
