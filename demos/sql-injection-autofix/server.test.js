const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const { promisify } = require('node:util');
const { createDemoApp } = require('./server');

let demo;
let server;
let baseUrl;

before(async () => {
  demo = await createDemoApp();
  server = demo.app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/impact-summary`;
});

after(async () => {
  if (server) await promisify(server.close.bind(server))();
  if (demo) await demo.close();
});

test('returns the unfiltered synthetic summary', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    totalDonations: 3,
    totalAmount: 850,
    totalBeneficiaries: 35
  });
});

test('filters the synthetic summary by region', async () => {
  const response = await fetch(`${baseUrl}?region=Europe`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    totalDonations: 1,
    totalAmount: 250,
    totalBeneficiaries: 10
  });
});

test('returns zero totals for an unknown region', async () => {
  const response = await fetch(`${baseUrl}?region=Unknown`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    totalDonations: 0,
    totalAmount: 0,
    totalBeneficiaries: 0
  });
});

test('rejects repeated region parameters', async () => {
  const response = await fetch(`${baseUrl}?region=Europe&region=Asia`);
  assert.equal(response.status, 400);
});
