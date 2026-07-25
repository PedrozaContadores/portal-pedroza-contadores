import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const ROOT = new URL('../', import.meta.url);
const DATA_URL = new URL('data/noticias.json', ROOT);
const SOURCES_URL = new URL('data/fontes.json', ROOT);
const CATEGORIES_URL = new URL('data/categorias.json', ROOT);
const SITEMAP_URL = new URL('sitemap-noticias.xml', ROOT);
const NEWS_SITEMAP_URL = new URL('news-sitemap.xml', ROOT);
const BASE_URL = 'https://pedrozacontadores.github.io/portal-pedroza-contadores';

const decodeEntities = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));

const stripHtml = (value = '') => decodeEntities(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getTag = (block, names) => {
  for (const name of names) {
    const pattern = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
    const match = block.match(pattern);
    if (match) return stripHtml(match[1]);
  }
  return '';
};

const getLink = (block) => {
  const atom = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (atom) return decodeEntities(atom[1]);
  return getTag(block, ['link', 'guid']);
};

const normalizeDate = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const slugify = (value) => value.normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 72);

const classify = (title, summary, fallback, categories) => {
  const text = `${title} ${summary}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let best = { name: fallback, score: 0 };
  for (const category of categories) {
    const score = category.palavras.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
    if (score > best.score) best = { name: category.nome, score };
  }
  return best.name;
};

const parseFeed = (xml, source, categories) => {
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((match) => match[2]);
  return blocks.map((block) => {
    const titulo = getTag(block, ['title']);
    const resumo = getTag(block, ['description', 'summary', 'content:encoded', 'content']).slice(0, 360);
    const urlFonte = getLink(block);
    const data = normalizeDate(getTag(block, ['pubDate', 'published', 'updated', 'dc:date']));
    if (!titulo || !urlFonte) return null;
    const hash = createHash('sha1').update(urlFonte).digest('hex').slice(0, 8);
    const slug = `${slugify(titulo)}-${hash}`;
    return {
      id: `auto-${source.id}-${hash}`,
      slug,
      titulo,
      resumo: resumo || `Leia a noticia completa publicada por ${source.nome}.`,
      categoria: classify(titulo, resumo, source.categoria_padrao, categories),
      data,
      atualizado: new Date().toISOString().slice(0, 10),
      imagem: source.imagem_padrao,
      fonte: source.sigla || source.nome,
      autor: source.nome,
      tipo: 'automatico',
      destaque: false,
      url_fonte: urlFonte,
      conteudo: [
        resumo || `Conteudo publicado originalmente por ${source.nome}.`,
        `Esta e uma sintese automatica. Consulte a publicacao original para ler o conteudo completo.`
      ]
    };
  }).filter(Boolean);
};

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'PortalPedrozaContadores/1.0 (+https://pedrozacontadores.github.io/portal-pedroza-contadores/)'
    },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

async function main() {
  const current = JSON.parse(await readFile(DATA_URL, 'utf8'));
  const config = JSON.parse(await readFile(SOURCES_URL, 'utf8'));
  const categories = JSON.parse(await readFile(CATEGORIES_URL, 'utf8'));
  const manual = current.filter((item) => item.tipo !== 'automatico');
  const automatic = [];

  for (const source of config.fontes.filter((item) => item.ativa && item.tipo === 'rss')) {
    try {
      const xml = await fetchFeed(source);
      const items = parseFeed(xml, source, categories).slice(0, config.limite_por_fonte || 15);
      automatic.push(...items);
      console.log(`[OK] ${source.nome}: ${items.length} noticias`);
    } catch (error) {
      console.error(`[AVISO] ${source.nome}: ${error.message}`);
    }
  }

  const deduplicated = [...manual, ...automatic]
    .filter((item, index, array) => index === array.findIndex((candidate) =>
      candidate.slug === item.slug || (candidate.url_fonte && candidate.url_fonte === item.url_fonte)))
    .sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo, 'pt-BR'));

  if (automatic.length === 0 && current.some((item) => item.tipo === 'automatico')) {
    console.log('[AVISO] Nenhuma fonte respondeu. Mantendo noticias automaticas existentes.');
    deduplicated.push(...current.filter((item) => item.tipo === 'automatico'));
  }

  const finalItems = deduplicated
    .filter((item, index, array) => index === array.findIndex((candidate) => candidate.slug === item.slug))
    .slice(0, 60);

  await writeFile(DATA_URL, `${JSON.stringify(finalItems, null, 2)}\n`, 'utf8');

  const urls = finalItems.map((item) => `  <url>\n    <loc>${xmlEscape(`${BASE_URL}/pages/noticia/?slug=${encodeURIComponent(item.slug)}`)}</loc>\n    <lastmod>${xmlEscape(item.atualizado || item.data)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.70</priority>\n  </url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(SITEMAP_URL, sitemap, 'utf8');

  const cutoff = Date.now() - (2 * 24 * 60 * 60 * 1000);
  const recentItems = finalItems.filter((item) => {
    const value = new Date(`${item.data}T12:00:00Z`).getTime();
    return Number.isFinite(value) && value >= cutoff;
  });
  const newsUrls = recentItems.map((item) => `  <url>
    <loc>${xmlEscape(`${BASE_URL}/pages/noticia/?slug=${encodeURIComponent(item.slug)}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Pedroza Contadores</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${xmlEscape(item.data)}</news:publication_date>
      <news:title>${xmlEscape(item.titulo)}</news:title>
    </news:news>
  </url>`).join('\n');
  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrls}
</urlset>
`;
  await writeFile(NEWS_SITEMAP_URL, newsSitemap, 'utf8');
  console.log(`[OK] Base final: ${finalItems.length} noticias`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
