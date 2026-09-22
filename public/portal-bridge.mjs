const TYPES = new Set(['PEKA_READY', 'PEKA_ACTIVITY', 'PEKA_ACTION', 'PEKA_COMPLETE']);
export function portalGameUrl(base, gameKey, playId) {
  const url = new URL(`/simulasi/booth/${encodeURIComponent(gameKey)}`, base);
  url.searchParams.set('playId', playId);
  return url.href;
}
export function isPortalMessage(event, expected) {
  if (!expected.source || event.source !== expected.source || event.origin !== expected.origin) return false;
  const data = event.data;
  if (!data || typeof data !== 'object' || !TYPES.has(data.type)) return false;
  if (data.playId !== expected.playId || data.gameKey !== expected.gameKey) return false;
  return data.type !== 'PEKA_ACTION' || (typeof data.actionKey === 'string' && data.actionKey.length <= 100 && typeof data.value === 'string' && data.value.length <= 100);
}
