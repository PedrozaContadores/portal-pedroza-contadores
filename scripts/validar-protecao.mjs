import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expectedVersion = '2.0.2';
const required = [
  'assets/js/protecao-portal.js',
  'pages/termos-de-uso/index.html',
  'docs/PROTECAO-PROPRIEDADE-INTELECTUAL-2.0.1.md',
  '.well-known/security.txt',
  'version.json'
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Arquivo obrigatorio ausente: ${file}`);
  }
}

function readPortalVersion(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
  if (!raw) throw new Error('version.json esta vazio.');

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed.replace(/^v/i, '').trim();
    if (parsed && typeof parsed.version === 'string') {
      return parsed.version.replace(/^v/i, '').trim();
    }
  } catch {
    // Compatibilidade com arquivos antigos que continham apenas v2.0.1.
  }

  const plain = raw.replace(/^['"]|['"]$/g, '').replace(/^v/i, '').trim();
  if (/^\d+\.\d+\.\d+$/.test(plain)) return plain;
  throw new Error('version.json nao contem JSON nem uma versao textual valida.');
}

const version = readPortalVersion(path.join(root, 'version.json'));
if (version !== expectedVersion) {
  throw new Error(`Versao inesperada: ${version}. Esperada: ${expectedVersion}.`);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'backups', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.toLowerCase().endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const relative = path.relative(root, file);
  if (!html.includes('portal-protection-version')) {
    throw new Error(`Marcador ausente: ${relative}`);
  }
  if (!html.includes('content="2.0.2"') && !html.includes("content='2.0.2'")) {
    throw new Error(`Marcador de versao desatualizado: ${relative}`);
  }
  if (!html.includes('protecao-portal.js')) {
    throw new Error(`Script de protecao ausente: ${relative}`);
  }
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/^\uFEFF/, '');
if (!home.includes('pages/termos-de-uso/')) {
  throw new Error('Link para Termos de Uso ausente no rodape da pagina inicial.');
}

console.log(`Protecao 2.0.2 validada em ${htmlFiles.length} paginas HTML.`);
