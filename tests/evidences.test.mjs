import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceApi } from '../src/features/evidences/api.ts';

test('registers metadata with the authenticated client, never image bytes', async () => {
  const calls = [];
  const result = { requestId: 12, evidenceNumber: 1, mediaUrl: 'https://example.com/photo.jpg', mediaType: 'image/jpeg' };
  const api = createEvidenceApi({ request: async (...args) => { calls.push(args); return result; } });
  const metadata = { mediaUrl: result.mediaUrl, mediaType: result.mediaType };
  assert.deepEqual(await api.add(12, metadata), result);
  assert.deepEqual(calls, [['/requests/12/evidences', { method: 'POST', body: metadata }]]);
});

test('rejects invalid request identifiers before making a request', () => {
  const api = createEvidenceApi({ request: () => { throw new Error('Unexpected HTTP call'); } });
  for (const id of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => api.list(id), /Invalid request ID/);
});

test('does not retry an uncertain backend write automatically', async () => {
  let calls = 0;
  const failure = new Error('Connection lost');
  const api = createEvidenceApi({ request: async () => { calls++; throw failure; } });
  await assert.rejects(api.add(1, { mediaUrl: 'https://example.com/p.jpg', mediaType: 'image/jpeg' }), failure);
  assert.equal(calls, 1);
});
