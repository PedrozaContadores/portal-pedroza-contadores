import { DATASETS, OFFICIAL_HOSTS } from './config.mjs';
import { collectUrls, hash, readJson } from './lib.mjs';

export async function validateAll() {
  const results = [];
  for (const dataset of DATASETS) {
    const data = await readJson(dataset.file, undefined).catch(() => null);
    if (data === null) {
      results.push({ id: dataset.id, file: dataset.file, valid: !dataset.required, missing: true, errors: dataset.required ? ['Arquivo obrigatório ausente'] : [] });
      continue;
    }
    const errors = [];
    const items = dataset.kind === 'array' ? data : data?.[dataset.listKey];
    if (!Array.isArray(items)) errors.push(`Coleção ${dataset.listKey || 'raiz'} deve ser uma lista`);
    else {
      const ids = new Set();
      items.forEach((item, index) => {
        if (!item || typeof item !== 'object') errors.push(`Item ${index} inválido`);
        const id = item?.id || item?.slug;
        if (!id) errors.push(`Item ${index} sem id/slug`);
        else if (ids.has(id)) errors.push(`Identificador duplicado: ${id}`);
        else ids.add(id);
      });
    }
    const urls = collectUrls(data);
    const nonOfficial = urls.filter((raw) => { try { const h = new URL(raw).hostname.toLowerCase(); return !OFFICIAL_HOSTS.some((o) => h === o || h.endsWith(`.${o}`)); } catch { return true; } });
    if (nonOfficial.length) errors.push(`${nonOfficial.length} link(s) fora da lista oficial`);
    results.push({ id: dataset.id, file: dataset.file, valid: errors.length === 0, missing: false, items: Array.isArray(items) ? items.length : 0, urls: urls.length, hash: hash(data), errors, nonOfficial });
  }
  return { valid: results.every((r) => r.valid), datasets: results };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await validateAll();
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}
