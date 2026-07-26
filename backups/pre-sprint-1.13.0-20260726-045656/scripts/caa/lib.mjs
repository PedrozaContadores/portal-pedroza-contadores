import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const now = () => new Date().toISOString();
export async function readJson(relative, fallback = null) {
  try { return JSON.parse(await readFile(path.join(ROOT, relative), 'utf8')); }
  catch (error) { if (fallback !== null) return fallback; throw error; }
}
export async function writeJson(relative, value) {
  const target = path.join(ROOT, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
export function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((o, k) => { o[k] = stable(value[k]); return o; }, {});
  return value;
}
export function hash(value) { return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex'); }
export function cleanText(value) { return typeof value === 'string' ? value.normalize('NFC').replace(/\s+/g, ' ').trim() : value; }
export function collectUrls(value, output = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => collectUrls(v, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectUrls(v, output));
  else if (typeof value === 'string' && /^https?:\/\//i.test(value)) output.add(value);
  return [...output];
}
