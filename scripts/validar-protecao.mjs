import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'assets/js/protecao-portal.js',
  'pages/termos-de-uso/index.html',
  'docs/PROTECAO-PROPRIEDADE-INTELECTUAL-2.0.1.md',
  '.well-known/security.txt',
  'version.json'
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatorio ausente: ${file}`);
}

const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
if (version.version !== '2.0.1') throw new Error(`Versao inesperada: ${version.version}`);

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'backups', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('portal-protection-version')) throw new Error(`Marcador ausente: ${path.relative(root, file)}`);
  if (!html.includes('protecao-portal.js')) throw new Error(`Script ausente: ${path.relative(root, file)}`);
}

console.log(`Protecao validada em ${htmlFiles.length} paginas HTML.`);
