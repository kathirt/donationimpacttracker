import { filterImpactData, summarizeImpactData } from './impactData';
import { mockDonations, mockImpactMetrics } from './mockData';

describe('filtered dashboard data', () => {
  it('combines region, donor, campaign, impact type and date filters', () => {
    const data = filterImpactData(mockDonations, mockImpactMetrics, {
      region: 'North America',
      donor: 'john-doe',
      campaign: 'school-lunch-program',
      impactType: 'meals_served',
      dateRange: { start: '2024-01-15', end: '2024-01-15' }
    });

    expect(data.metrics.map(metric => metric.id)).toEqual(['imp-001']);
    expect(data.donations.map(donation => donation.id)).toEqual(['don-001']);
    expect(summarizeImpactData(data.donations, data.metrics)).toMatchObject({
      totalDonations: 1,
      totalAmount: 500,
      impactsByType: { meals_served: { total: 150 } }
    });
  });

  it.each([
    [{ region: 'Europe' }, ['imp-002', 'imp-007']],
    [{ donor: 'donor-001' }, ['imp-001', 'imp-005']],
    [{ campaign: 'library-books-drive' }, ['imp-004', 'imp-007']],
    [{ impactType: 'scholarships_provided' }, ['imp-003', 'imp-008']],
    [{ impactType: 'tablets_distributed' }, ['imp-002']],
    [{ dateRange: { start: '2024-01-03', end: '2024-01-05' } }, ['imp-007', 'imp-008']]
  ])('applies %j independently', (filters, ids) => {
    expect(filterImpactData(mockDonations, mockImpactMetrics, filters).metrics.map(metric => metric.id)).toEqual(ids);
  });

  it('keeps mixed impact types separate without inferring unique beneficiaries', () => {
    const summary = summarizeImpactData(mockDonations, mockImpactMetrics);
    expect(summary.impactsByType).toEqual({
      meals_served: { total: 750, description: 'meals served' },
      books_distributed: { total: 90, description: 'books distributed' },
      tablets_distributed: { total: 25, description: 'tablets distributed' },
      scholarships_provided: { total: 3, description: 'scholarships provided' },
      students_supported: { total: 30, description: 'students supported' }
    });
    expect(summary.totalBeneficiaries).toBeNull();
    expect(Object.values(summary.regionBreakdown).every(region => region.beneficiaries === null)).toBe(true);
  });

  it('returns no data for incompatible filters, rather than global totals', () => {
    const data = filterImpactData(mockDonations, mockImpactMetrics, {
      region: 'Asia',
      impactType: 'meals_served'
    });
    expect(data).toEqual({ metrics: [], donations: [] });
    expect(summarizeImpactData(data.donations, data.metrics).impactsByType).toEqual({});
  });
});
