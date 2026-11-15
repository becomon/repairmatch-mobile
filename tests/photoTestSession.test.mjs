import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhotoTestSession } from '../src/dev/photoTestSession.ts';

test('test adapter authenticates and scopes photo requests using the access token', async () => {
  const original = globalThis.fetch;
  const calls = [];
  const responses = [ { accessToken: 'synthetic-test-token' }, { id: 'test', name: 'Test', role: 'CLIENT' }, { content: [{id: 4, originalDescription: 'Test appliance'}] }, [] ];
  globalThis.fetch = async (url, options) => { calls.push({url, ...options}); return Response.json(responses.shift()); };
  try {
    const session = createPhotoTestSession('http://192.168.1.12:8080/api');
    await session.login(' test@example.test ', 'synthetic-password');
    assert.equal((await session.requests())[0].id, 4);
    await session.client.request('/requests/4/evidences');
    assert.equal(calls[0].headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(calls[0].body), {email:'test@example.test', password:'synthetic-password'});
    assert.equal(calls[1].headers.Authorization, 'Bearer synthetic-test-token');
    assert.equal(calls[3].url, 'http://192.168.1.12:8080/api/requests/4/evidences');
    session.clear();
    globalThis.fetch = async (_url, options) => { assert.equal(options.headers.Authorization, undefined); return Response.json([]); };
    await session.client.request('/requests/4/evidences');
  } finally { globalThis.fetch = original; }
});

test('refuses plaintext remote credentials and embedded credentials', () => {
  for (const url of ['http://example.com/api', 'https://user:pass@example.com/api', 'https://example.com/api?token=x']) {
    assert.throws(() => createPhotoTestSession(url));
  }
});

test('blocks technician accounts in the photo test screen', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => Response.json(calls++ === 0 ? {accessToken:'synthetic-token'} : {role:'TECHNICIAN'});
  try {
    await assert.rejects(createPhotoTestSession('https://example.test/api').login('t@example.test','test'), /cuenta cliente propietaria/);
  } finally { globalThis.fetch = original; }
});
