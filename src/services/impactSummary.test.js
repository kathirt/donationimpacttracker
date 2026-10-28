const httpTrigger = jest.requireActual('../../api/impact-summary').default;

async function getSummary(query = {}) {
  const context = { log: Object.assign(jest.fn(), { error: jest.fn() }) };
  await httpTrigger(context, { method: 'GET', query });
  return context.res;
}

test('unfiltered summary preserves demo totals and aggregates regional charts', async () => {
  const { status, body } = await getSummary();
  expect(status).toBe(200);
  expect(body).toMatchObject({
    totalDonations: 1247, totalAmount: 185420, totalBeneficiaries: 3892
  });
  expect(Object.keys(body.regionBreakdown)).toHaveLength(4);
  expect(Object.values(body.regionBreakdown).reduce((sum, data) => sum + data.amount, 0))
    .toBe(body.totalAmount);
  expect(Object.fromEntries(Object.entries(body.impactsByType).map(([type, data]) => [type, data.total])))
    .toEqual({ meals_served: 15640, books_distributed: 4820, students_supported: 2150, scholarships_provided: 89 });
});

test.each(['North America', 'Europe', 'Asia', 'Africa'])(
  '%s filters headlines and both chart datasets',
  async region => {
    const global = (await getSummary()).body;
    const { status, body } = await getSummary({ region });
    expect(status).toBe(200);
    expect(Object.keys(body.regionBreakdown)).toEqual([region]);
    expect(body.totalDonations).toBe(global.regionBreakdown[region].donations);
    expect(body.totalAmount).toBe(global.regionBreakdown[region].amount);
    expect(body.totalBeneficiaries).toBe(global.regionBreakdown[region].beneficiaries);
    for (const [type, data] of Object.entries(body.impactsByType)) {
      expect(data.total).toBeGreaterThan(0);
      expect(data.total).toBeLessThan(global.impactsByType[type].total);
    }
  }
);

test('regional impact distributions add up to the unfiltered distribution', async () => {
  const global = (await getSummary()).body;
  const regions = await Promise.all(Object.keys(global.regionBreakdown).map(async region =>
    (await getSummary({ region })).body
  ));
  for (const [type, data] of Object.entries(global.impactsByType)) {
    expect(regions.reduce((sum, summary) => sum + summary.impactsByType[type].total, 0)).toBe(data.total);
  }
});

test.each(['South America', 'unknown', '__proto__'])('%s returns an empty summary, not global totals', async region => {
  const { status, body } = await getSummary({ region });
  expect(status).toBe(200);
  expect(body).toMatchObject({
    totalDonations: 0, totalAmount: 0, totalBeneficiaries: 0, regionBreakdown: {}
  });
  expect(Object.values(body.impactsByType).every(data => data.total === 0)).toBe(true);
});

test.each(['donor', 'campaign', 'impactType', 'type', 'startDate', 'endDate'])(
  'rejects unsupported %s instead of returning an unfiltered success',
  async filter => {
    const response = await getSummary({ region: 'Europe', [filter]: 'value' });
    expect(response.status).toBe(400);
    expect(response.body.unsupportedFilters).toEqual([filter]);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  }
);

test('empty filter values mean no filter and do not mutate subsequent responses', async () => {
  expect((await getSummary({ region: '', donor: '' })).body).toEqual((await getSummary()).body);
  await getSummary({ region: 'Europe' });
  expect((await getSummary()).body.totalAmount).toBe(185420);
});
