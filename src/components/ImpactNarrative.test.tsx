import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ImpactNarrative } from './ImpactNarrative';
import { AzureOpenAIService } from '../services/openai';
import { mockImpactMetrics } from '../data/mockData';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  jest.restoreAllMocks();
});

it('does not let a response for old filters replace the current narrative', async () => {
  let resolveOld!: (value: string) => void;
  const oldResponse = new Promise<string>(resolve => { resolveOld = resolve; });
  jest.spyOn(AzureOpenAIService, 'generateImpactSummary')
    .mockReturnValueOnce(oldResponse)
    .mockResolvedValueOnce('Current Europe story');

  await act(async () => root.render(
    <ImpactNarrative type="summary" region="Asia" metrics={[mockImpactMetrics[2]]} dataSource="sample" />
  ));
  await act(async () => root.render(
    <ImpactNarrative type="summary" region="Europe" metrics={[mockImpactMetrics[1]]} dataSource="sample" />
  ));
  await act(async () => { resolveOld('Outdated Asia story'); });

  expect(container.textContent).toContain('Current Europe story');
  expect(container.textContent).not.toContain('Outdated Asia story');
});

it('does not generate a narrative when provenance or matching data is unavailable', async () => {
  const generate = jest.spyOn(AzureOpenAIService, 'generateImpactSummary');
  await act(async () => root.render(<ImpactNarrative type="summary" metrics={mockImpactMetrics} />));
  expect(container.textContent).toContain('Impact data unavailable');
  expect(container.textContent).toContain('Not enough verified impact data');
  expect(generate).not.toHaveBeenCalled();

  await act(async () => root.render(<ImpactNarrative type="summary" metrics={[]} dataSource="sample" />));
  expect(container.textContent).toContain('Sample data');
  expect(container.textContent).toContain('Not enough verified impact data');
  expect(generate).not.toHaveBeenCalled();
});

it('uses supplied campaign metrics without loading unrelated mock records', async () => {
  const generate = jest.spyOn(AzureOpenAIService, 'generateCampaignUpdate').mockResolvedValue('Campaign activity');
  const metrics = [mockImpactMetrics[1]];
  await act(async () => root.render(
    <ImpactNarrative type="campaign" campaign="Digital Learning Initiative" region="Europe" metrics={metrics} dataSource="verified" />
  ));
  expect(generate).toHaveBeenCalledWith('Digital Learning Initiative', 'Europe', metrics, 'verified');
  expect(container.textContent).toContain('Verified activity data');
  expect(container.textContent).toContain('Campaign activity');
  expect(container.textContent).not.toContain('Sample data');
});
