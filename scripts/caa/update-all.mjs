import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { CAA_VERSION, DATASETS } from './config.mjs';
import { hash, now, readJson, ROOT, writeJson } from './lib.mjs';
import { validateAll } from './validate-all.mjs';
import { validateLinks } from './validate-links.mjs';

const run = (script) => new Promise((resolve) => {
  const child = spawn(process.execPath, [script], { cwd: ROOT, stdio: 'inherit' });
  child.on('exit', (code) => resolve({ script, code: code ?? 1 }));
});
const exists = async (relative) => access(path.join(ROOT, relative)).then(() => true).catch(() => false);

const startedAt = now();
const previous = await readJson('data/caa-consolidado.json', { datasets: {} });
const updaters = ['scripts/atualizar-legislacao.mjs', 'scripts/atualizar-noticias.mjs', 'scripts/atualizar-certidoes.mjs', 'scripts/atualizar-obrigacoes.mjs', 'scripts/atualizar-tabelas.mjs', 'scripts/gerar-pesquisa-global.mjs'];
const executions = [];
if (process.env.CAA_SKIP_SOURCES !== '1') {
  for (const script of updaters) if (await exists(script)) executions.push(await run(script));
}

const validation = await validateAll();
if (!validation.valid) {
  await writeJson('data/caa-status.json', { version: CAA_VERSION, status: 'falha-validacao', startedAt, finishedAt: now(), executions, validation });
  throw new Error('CAA interrompida: JSON inválido ou fonte não oficial detectada.');
}
const linkReport = process.env.CAA_SKIP_LINKS === '1' ? { checkedAt: now(), skipped: true, total: 0, online: 0, alerts: 0, results: [] } : await validateLinks();
const datasets = {};
for (const config of DATASETS) {
  if (!(await exists(config.file))) { datasets[config.id] = { file: config.file, available: false, required: config.required }; continue; }
  const data = await readJson(config.file);
  const items = config.kind === 'array' ? data : data[config.listKey];
  datasets[config.id] = { file: config.file, available: true, required: config.required, items: items.length, hash: hash(data), updatedAt: data.atualizadoEm || data.atualizado || now() };
}
const changes = Object.entries(datasets).filter(([id, current]) => current.hash && previous.datasets?.[id]?.hash !== current.hash).map(([id]) => id);
const optionalMissing = Object.values(datasets).filter((item) => !item.available && !item.required).length;
const status = linkReport.alerts ? 'concluido-com-alertas' : optionalMissing ? 'concluido-com-pendencias' : 'concluido';
const consolidated = { version: CAA_VERSION, generatedAt: now(), policy: 'Conteúdos dinâmicos sincronizados exclusivamente a partir de fontes oficiais.', status, changes, datasets, pending: optionalMissing ? ['Agenda Tributária Inteligente ausente na base recebida; integração será ativada automaticamente quando data/agenda-tributaria.json estiver presente.'] : [], linkValidation: { checkedAt: linkReport.checkedAt, total: linkReport.total, online: linkReport.online, alerts: linkReport.alerts } };
await writeJson('data/caa-consolidado.json', consolidated);
await writeJson('data/caa-links.json', linkReport);
const history = await readJson('data/caa-historico.json', { version: 1, entries: [] });
history.entries.unshift({ id: `${startedAt}-${hash(consolidated).slice(0, 10)}`, version: CAA_VERSION, startedAt, finishedAt: now(), status: consolidated.status, changes, datasets: Object.fromEntries(Object.entries(datasets).map(([id, d]) => [id, { hash: d.hash || null, items: d.items || 0, available: d.available }])) });
history.entries = history.entries.slice(0, 180);
await writeJson('data/caa-historico.json', history);
await writeJson('data/caa-status.json', { version: CAA_VERSION, status: consolidated.status, startedAt, finishedAt: now(), executions, validation, linkValidation: consolidated.linkValidation, changes });
console.log(`CAA ${CAA_VERSION}: ${changes.length} conjunto(s) alterado(s); ${linkReport.alerts} alerta(s) de link.`);
