import { readJson, writeJson, now } from './caa/lib.mjs';
const data=await readJson('data/certidoes.json');
data.total=Array.isArray(data.itens)?data.itens.length:0;
data.atualizadoEm=now();
await writeJson('data/certidoes.json',data);
console.log(`CIC: ${data.total} certidões consolidadas.`);
