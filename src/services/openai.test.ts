import { AzureOpenAIService } from './openai';
import { mockDonations, mockImpactMetrics } from '../data/mockData';
import { filterImpactData } from '../data/impactData';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const resolveNarrative = async (result: Promise<string>) => {
  jest.runAllTimers();
  return result;
};

it('describes only the filtered region and activity values', async () => {
  const { metrics } = filterImpactData(mockDonations, mockImpactMetrics, { region: 'Europe' });
  const narrative = await resolveNarrative(AzureOpenAIService.generateImpactSummary('Europe', metrics, 'sample'));
  expect(narrative).toContain('Europe');
  expect(narrative).toContain('15 books distributed');
  expect(narrative).toContain('25 tablets distributed');
  expect(narrative).not.toContain('40 books');
  expect(narrative).not.toContain('meals served');
  expect(narrative).not.toContain('scholarships provided');
  expect(narrative).toContain('not verified impact');
});

it('reports mixed units separately in summaries and campaign updates', async () => {
  const summary = await resolveNarrative(AzureOpenAIService.generateImpactSummary('global', mockImpactMetrics, 'sample'));
  const campaign = await resolveNarrative(AzureOpenAIService.generateCampaignUpdate('Education', 'global', mockImpactMetrics, 'sample'));
  for (const narrative of [summary, campaign]) {
    expect(narrative).toContain('750 meals served');
    expect(narrative).toContain('90 books distributed');
    expect(narrative).toContain('25 tablets distributed');
    expect(narrative).toContain('30 students supported');
    expect(narrative).toContain('3 scholarships provided');
    expect(narrative).not.toContain('898');
    expect(narrative).not.toContain('450');
    expect(narrative).toContain('not a count of unique beneficiaries');
  }
});

it('does not invent counts for empty, invalid or unverified inputs', async () => {
  for (const metrics of [[], [{ ...mockImpactMetrics[0], value: NaN }]]) {
    const narrative = await resolveNarrative(AzureOpenAIService.generateImpactSummary('Asia', metrics, 'verified'));
    expect(narrative).toContain('Not enough verified impact data');
    expect(narrative).not.toContain('2,500');
  }
  const unavailable = await resolveNarrative(AzureOpenAIService.generateImpactSummary('Asia', mockImpactMetrics));
  expect(unavailable).toContain('Not enough verified impact data');
});

it('preserves zero counts and distinguishes verified from sample data', async () => {
  const narrative = await resolveNarrative(AzureOpenAIService.generateImpactSummary(
    'North America', [{ ...mockImpactMetrics[0], value: 0 }], 'verified'
  ));
  expect(narrative).toContain('Based on verified activity data');
  expect(narrative).toContain('0 meals served');
  expect(narrative).not.toContain('Sample data');
});
