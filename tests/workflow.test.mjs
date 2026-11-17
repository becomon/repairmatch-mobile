import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestsApi } from '../src/services/requests.ts';
import { createWorkflowApi } from '../src/services/workflow.ts';
import { parseCoordinates } from '../src/utils/coordinates.ts';

test('coordinates support omission, zero and real southern/western positions', () => {
  assert.deepEqual(parseCoordinates('', ''), {});
  assert.deepEqual(parseCoordinates('0', '0', true), { latitude: 0, longitude: 0 });
  assert.deepEqual(parseCoordinates('-12.04', '-77.03'), { latitude: -12.04, longitude: -77.03 });
});
test('coordinates reject missing pairs, out of range values and invalid numeric input', () => {
  for (const [lat, lon] of [['', '0'], ['0', ''], ['91', '0'], ['0', '-181'], ['NaN', '0'], ['Infinity', '0']]) assert.throws(() => parseCoordinates(lat, lon));
  assert.throws(() => parseCoordinates('', '', true));
});
test('creation and GPS persist using the real backend contract', async () => {
  const calls = [];
  const api = createRequestsApi({ request: async (...args) => { calls.push(args); return { id: 6 }; } });
  const body = { applianceTypeId: 2, originalDescription: 'No enfría', ...parseCoordinates('-12', '-77') };
  await api.create(body);
  await api.location(6, { latitude: -12, longitude: -77 });
  await api.list(2);
  assert.deepEqual(calls, [
    ['/requests', { method: 'POST', body }],
    ['/requests/6/location', { method: 'PATCH', body: { latitude: -12, longitude: -77 } }],
    ['/requests?page=2&size=20'],
  ]);
});
test('service transitions use query parameters and reviews use JSON bodies', async () => {
  const calls = [];
  const api = createWorkflowApi({ request: async (...args) => { calls.push(args); return {}; } });
  await api.accept(4);
  await api.status(3, 'COMPLETADO');
  await api.saveReview(3, { rating: 5, comment: 'Buen servicio' });
  assert.deepEqual(calls, [
    ['/proposals/4/accept', { method: 'POST' }],
    ['/services/3/status?status=COMPLETADO', { method: 'PATCH' }],
    ['/services/3/review', { method: 'POST', body: { rating: 5, comment: 'Buen servicio' } }],
  ]);
});
test('failed writes propagate without automatic duplicate submissions', async () => {
  let calls = 0;
  const api = createRequestsApi({ request: async () => { calls++; throw new Error('offline'); } });
  await assert.rejects(api.create({ applianceTypeId: 1, originalDescription: 'Falla' }), /offline/);
  assert.equal(calls, 1);
});
