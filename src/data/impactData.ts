import { Donation, FilterOptions, ImpactMetric, ImpactSummary } from '../types';

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

export const filterImpactData = (
  donations: Donation[],
  metrics: ImpactMetric[],
  filters: FilterOptions
) => {
  const matchingDonations = donations.filter(donation =>
    (!filters.donor || donation.donorId === filters.donor ||
      normalize(donation.donorName) === normalize(filters.donor)) &&
    (!filters.campaign || normalize(donation.campaign) === normalize(filters.campaign)) &&
    (!filters.region || donation.region === filters.region)
  );
  const donationIds = new Set(matchingDonations.map(donation => donation.id));
  const filteredMetrics = metrics.filter(metric =>
    donationIds.has(metric.donationId) &&
    (!filters.region || metric.region === filters.region) &&
    (!filters.impactType || metric.type === filters.impactType) &&
    (!filters.dateRange || (metric.date >= filters.dateRange.start && metric.date <= filters.dateRange.end)) &&
    Number.isFinite(metric.value) && metric.value >= 0
  );
  const matchingIds = new Set(filteredMetrics.map(metric => metric.donationId));

  return {
    metrics: filteredMetrics,
    donations: matchingDonations.filter(donation => matchingIds.has(donation.id))
  };
};

export const aggregateImpactMetrics = (
  metrics: Pick<ImpactMetric, 'type' | 'value'>[]
): ImpactSummary['impactsByType'] => {
  const totals: ImpactSummary['impactsByType'] = {};
  metrics.forEach(metric => {
    if (!Number.isFinite(metric.value) || metric.value < 0) return;
    if (!totals[metric.type]) {
      totals[metric.type] = { total: 0, description: metric.type.replace(/_/g, ' ') };
    }
    totals[metric.type].total += metric.value;
  });
  return totals;
};

export const summarizeImpactData = (donations: Donation[], metrics: ImpactMetric[]): ImpactSummary => {
  const regionBreakdown: ImpactSummary['regionBreakdown'] = {};
  donations.forEach(donation => {
    if (!regionBreakdown[donation.region]) {
      regionBreakdown[donation.region] = { donations: 0, amount: 0, beneficiaries: null };
    }
    regionBreakdown[donation.region].donations += 1;
    regionBreakdown[donation.region].amount += donation.amount;
  });

  return {
    totalDonations: donations.length,
    totalAmount: donations.reduce((total, donation) => total + donation.amount, 0),
    // Activity records do not identify unique beneficiaries.
    totalBeneficiaries: null,
    impactsByType: aggregateImpactMetrics(metrics),
    regionBreakdown
  };
};
