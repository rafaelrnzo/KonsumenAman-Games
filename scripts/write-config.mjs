import { writeFile } from 'node:fs/promises';

const value = (process.env.GAME_API_BASE_URL ?? '').replace(/\/+$/, '');
if (!value) throw new Error('GAME_API_BASE_URL wajib diisi saat build produksi.');
await writeFile('public/config.mjs', `export const GAME_API_BASE_URL = ${JSON.stringify(value)};\n`);
