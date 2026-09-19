import { writeFile } from 'node:fs/promises';

const productionApiBaseUrl = 'https://api.shinka-solutions.id';
const configuredValue = (process.env.GAME_API_BASE_URL ?? '').replace(/\/+$/, '');
const value = configuredValue || (process.env.VERCEL_ENV === 'production' ? productionApiBaseUrl : '');

await writeFile('public/config.mjs', `export const GAME_API_BASE_URL = ${JSON.stringify(value)};\n`);
