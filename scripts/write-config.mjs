import { writeFile } from 'node:fs/promises';

const productionApiBaseUrl = 'https://api.shinka-solutions.id';
const configuredValue = (process.env.GAME_API_BASE_URL ?? '').replace(/\/+$/, '');
const value = configuredValue || (process.env.VERCEL_ENV === 'production' ? productionApiBaseUrl : '');

const portalUrl = process.env.SIMULATION_PORTAL_URL || 'https://www.konsumenaman.id';
if (!['http:', 'https:'].includes(new URL(portalUrl).protocol)) throw new Error('Invalid simulation portal URL');
await writeFile('public/config.mjs', `export const GAME_API_BASE_URL = ${JSON.stringify(value)};\nexport const SIMULATION_PORTAL_URL = ${JSON.stringify(portalUrl)};\n`);
