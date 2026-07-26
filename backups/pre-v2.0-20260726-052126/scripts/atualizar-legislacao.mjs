import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../data/legislacao.json', import.meta.url);
const data = JSON.parse(await readFile(file, 'utf8'));
const checkedAt = new Date().toISOString();

async function verify(item) {
  try {
    const response = await fetch(item.url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Portal-Pedroza-Contadores-BTI/1.10' },
      signal: AbortSignal.timeout(20000)
    });
    return { ...item, verificacao: { status: response.ok ? 'online' : 'indisponivel', codigo: response.status, verificadoEm: checkedAt, urlFinal: response.url } };
  } catch (error) {
    return { ...item, verificacao: { status: 'erro', codigo: 0, verificadoEm: checkedAt, mensagem: String(error.message || error) } };
  }
}

const results = [];
for (const item of data.itens) results.push(await verify(item));
data.itens = results;
data.verificadoEm = checkedAt;
data.resumoVerificacao = {
  total: results.length,
  online: results.filter((item) => item.verificacao.status === 'online').length,
  alertas: results.filter((item) => item.verificacao.status !== 'online').length
};
await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`BTI verificada: ${data.resumoVerificacao.online}/${data.resumoVerificacao.total} fontes online.`);
