const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const baseUrl = 'https://pedrozacontadores.github.io/portal-pedroza-contadores';
const article = document.querySelector('#article-content');
const errorBox = document.querySelector('#article-error');
const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const setMeta = (selector, value, attr = 'content') => { const node = document.querySelector(selector); if (node) node.setAttribute(attr, value); };
const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
function renderBody(item) {
  const paragraphs = Array.isArray(item.conteudo) && item.conteudo.length ? item.conteudo : [item.resumo];
  return paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('');
}
function configureSeo(item) {
  const pageUrl = `${baseUrl}/pages/noticia/?slug=${encodeURIComponent(item.slug)}`;
  const imageUrl = new URL(item.imagem, window.location.href).href;
  document.title = `${item.titulo} | Pedroza Contadores`;
  setMeta('meta[name="description"]', item.resumo);
  setMeta('#canonical-link', pageUrl, 'href');
  setMeta('#og-title', item.titulo);
  setMeta('#og-description', item.resumo);
  setMeta('#og-url', pageUrl);
  setMeta('#og-image', imageUrl);
  document.querySelector('#news-schema').textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: item.titulo,
    description: item.resumo, datePublished: item.data, dateModified: item.atualizado || item.data,
    image: [imageUrl], author: { '@type': 'Organization', name: item.autor || 'Pedroza Contadores' },
    publisher: { '@type': 'Organization', name: 'Pedroza Contadores', logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/images/logo-pedroza-contadores.svg` } },
    mainEntityOfPage: pageUrl
  });
}
async function init() {
  try {
    if (!slug) throw new Error('Slug ausente');
    const response = await fetch('../../data/noticias.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar: ${response.status}`);
    const items = await response.json();
    const item = items.find((news) => news.slug === slug);
    if (!item) throw new Error('Notícia não encontrada');
    document.querySelector('#breadcrumb-current').textContent = item.titulo;
    document.querySelector('#article-category').textContent = item.categoria;
    const time = document.querySelector('#article-date'); time.textContent = formatDate(item.data); time.dateTime = item.data;
    document.querySelector('#article-title').textContent = item.titulo;
    document.querySelector('#article-summary').textContent = item.resumo;
    document.querySelector('#article-source').textContent = `Fonte: ${item.fonte}`;
    const image = document.querySelector('#article-image'); image.src = item.imagem; image.alt = item.titulo;
    document.querySelector('#article-body').innerHTML = renderBody(item);
    configureSeo(item); article.hidden = false;
  } catch (error) { console.error(error); errorBox.hidden = false; }
}
init();
