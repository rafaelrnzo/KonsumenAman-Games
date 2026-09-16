import { GAME_API_BASE_URL } from './config.mjs';

export class BoothApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'BoothApiError';
    this.status = status;
  }
}

export function createBoothApi(apiBaseUrl, fetcher = fetch) {
  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  async function request(path, options = {}) {
    if (!baseUrl) throw new BoothApiError('Backend Sesi Game belum dikonfigurasi.');
    let response;
    try {
      response = await fetcher(`${baseUrl}${path}`, {
        ...options,
        headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      });
    } catch {
      throw new BoothApiError('Tidak dapat terhubung ke backend Sesi Game.');
    }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new BoothApiError(typeof body?.detail === 'string' ? body.detail : 'Permintaan Sesi Game gagal.', response.status);
    }
    return body;
  }
  return {
    getBooth: boothId => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}`),
    createParticipant: (boothId, nickname, requestId) => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}/participants`, { method: 'POST', body: JSON.stringify({ nickname, requestId }) }),
    createPlay: (boothId, body) => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}/plays`, { method: 'POST', body: JSON.stringify(body) }),
    saveAction: (boothId, playId, body) => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}/plays/${playId}/actions`, { method: 'POST', body: JSON.stringify(body) }),
    completePlay: (boothId, playId) => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}/plays/${playId}/complete`, { method: 'POST' }),
    abandonPlay: (boothId, playId) => request(`/api/v1/public/game-sessions/${encodeURIComponent(boothId)}/plays/${playId}/abandon`, { method: 'POST' }),
  };
}

const api = createBoothApi(GAME_API_BASE_URL);
export const { getBooth, createParticipant, createPlay, saveAction, completePlay, abandonPlay } = api;
