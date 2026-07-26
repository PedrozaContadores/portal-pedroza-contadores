import { DATASETS, LINK_TIMEOUT_MS, OFFICIAL_HOSTS } from './config.mjs';
import { collectUrls, now, readJson } from './lib.mjs';

const isOfficial = (raw) => { try { const h = new URL(raw).hostname.toLowerCase(); return OFFICIAL_HOSTS.some((o) => h === o || h.endsWith(`.${o}`)); } catch { return false; } };
async function check(url) {
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(LINK_TIMEOUT_MS), headers: { 'User-Agent': 'Portal-Pedroza-CAA/2.0.0' } });
    if ([403, 405].includes(response.status)) response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(LINK_TIMEOUT_MS), headers: { 'User-Agent': 'Portal-Pedroza-CAA/2.0.0' } });
    return { url, status: response.ok ? 'online' : 'alerta', code: response.status, finalUrl: response.url };
  } catch (error) { return { url, status: 'erro', code: 0, message: String(error.message || error) }; }
}
export async function validateLinks() {
  const urls = new Set();
  for (const dataset of DATASETS) {
    try {
      const data = await readJson(dataset.file);
      collectUrls(data).filter(isOfficial).forEach((url) => urls.add(url));
    } catch (error) {
      if (error?.code !== 'ENOENT' || dataset.required) throw error;
    }
  }
  const results = [];
  for (const url of urls) results.push(await check(url));
  return { checkedAt: now(), total: results.length, online: results.filter((r) => r.status === 'online').length, alerts: results.filter((r) => r.status !== 'online').length, results };
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await validateLinks(), null, 2));
