import assert from 'node:assert/strict';
import test from 'node:test';
import { BoothApiError, createBoothApi } from '../public/booth-api.mjs';

test('booth API scopes participant and play requests to one booth', async () => {
  const calls = [];
  const api = createBoothApi('https://api.example.test/', async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  await api.createParticipant('booth a', 'Raya', 'request-1');
  await api.createPlay('booth a', { participantId: 'participant-1', gameKey: 'stop-or-go', requestId: 'request-2' });

  assert.equal(calls[0].url, 'https://api.example.test/api/v1/public/game-sessions/booth%20a/participants');
  assert.deepEqual(JSON.parse(calls[0].options.body), { nickname: 'Raya', requestId: 'request-1' });
  assert.equal(calls[1].url, 'https://api.example.test/api/v1/public/game-sessions/booth%20a/plays');
});

test('booth API keeps backend status and message on failure', async () => {
  const api = createBoothApi('https://api.example.test', async () => new Response(
    JSON.stringify({ detail: 'Sesi Game ditutup.' }),
    { status: 409, headers: { 'Content-Type': 'application/json' } },
  ));
  await assert.rejects(
    api.completePlay('booth-1', 'play-1'),
    error => error instanceof BoothApiError && error.status === 409 && error.message === 'Sesi Game ditutup.',
  );
});

test('booth API rejects missing build configuration', async () => {
  const api = createBoothApi('', async () => { throw new Error('must not run'); });
  await assert.rejects(api.getBooth('booth-1'), /belum dikonfigurasi/);
});
