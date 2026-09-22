import assert from 'node:assert/strict';
import test from 'node:test';
import { isPortalMessage, portalGameUrl } from '../public/portal-bridge.mjs';

test('portal bridge only accepts the active game frame and play', () => {
  const source = {};
  const expected = { origin: 'https://www.konsumenaman.id', source, playId: 'play-a', gameKey: 'anti-qris-palsu' };
  const event = { source, origin: expected.origin, data: { type: 'PEKA_ACTION', playId: 'play-a', gameKey: expected.gameKey, actionKey: 'warung', value: 'pay' } };
  assert.equal(isPortalMessage(event, expected), true);
  assert.equal(isPortalMessage({ ...event, origin: 'https://wrong.test' }, expected), false);
  assert.equal(isPortalMessage({ ...event, source: {} }, expected), false);
  for (const data of [{ ...event.data, playId: 'old-play' }, { ...event.data, gameKey: 'inbox-phishing' }, { ...event.data, actionKey: 5 }, { ...event.data, type: 'SCORE', score: 1000 }, null]) {
    assert.equal(isPortalMessage({ ...event, data }, expected), false);
  }
});
test('portal URL opens the real simulation without participant credentials', () => {
  assert.equal(portalGameUrl('https://www.konsumenaman.id', 'anti-qris-palsu', 'play-a'), 'https://www.konsumenaman.id/simulasi/booth/anti-qris-palsu?playId=play-a');
});
