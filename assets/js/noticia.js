const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const baseUrl = 'https://pedroza.com.br';
const article = document.querySelector('#article-content');
const errorBox = document.querySelector('#article-error');
const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const setMeta = (selector, value, attr = 'content') => { const node = document.querySelector(selector); if (node) node.setAttribute(attr, value); };
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
function renderBody(item) {
  const paragraphs = Array.isArray(item.conteudo) && item.conteudo.length ? item.conteudo : [item.resumo];
  return paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('');
}
function configureSeo(item) {
  const pageUrl = `${baseUrl}/pages/noticia/?slug=${encodeURIComponent(item.slug)}`;
  const imageUrl = new URL(item.imagem, window.location.href).href;
  const modified = item.atualizado || item.data;
  const keywords = [item.categoria, item.fonte, 'contabilidade', 'notícias contábeis', 'Pedroza Contadores'].filter(Boolean).join(', ');
  document.title = `${item.titulo} | Pedroza Contadores`;
  setMeta('meta[name="description"]', item.resumo);
  setMeta('#meta-keywords', keywords);
  setMeta('#canonical-link', pageUrl, 'href');
  setMeta('#og-title', item.titulo);
  setMeta('#og-description', item.resumo);
  setMeta('#og-url', pageUrl);
  setMeta('#og-image', imageUrl);
  setMeta('#twitter-title', item.titulo);
  setMeta('#twitter-description', item.resumo);
  setMeta('#twitter-image', imageUrl);
  setMeta('#article-published', `${item.data}T12:00:00-03:00`);
  setMeta('#article-modified', `${modified}T12:00:00-03:00`);
  setMeta('#article-section', item.categoria);
  setMeta('#article-author', item.autor || 'Pedroza Contadores');
  document.querySelector('#news-schema').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.titulo,
    description: item.resumo,
    datePublished: `${item.data}T12:00:00-03:00`,
    dateModified: `${modified}T12:00:00-03:00`,
    image: [imageUrl],
    articleSection: item.categoria,
    keywords,
    author: { '@type': 'Organization', name: item.autor || 'Pedroza Contadores' },
    publisher: { '@type': 'Organization', name: 'Pedroza Contadores', logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/images/logo-pedroza-contadores.svg` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    isAccessibleForFree: true
  });
  document.querySelector('#breadcrumb-schema').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Notícias', item: `${baseUrl}/pages/noticias/` },
      { '@type': 'ListItem', position: 3, name: item.titulo, item: pageUrl }
    ]
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
    const source = document.querySelector('#article-source');
    source.innerHTML = item.url_fonte ? `Fonte: <a href="${escapeHtml(item.url_fonte)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.fonte)}</a>` : `Fonte: ${escapeHtml(item.fonte)}`;
    const image = document.querySelector('#article-image'); image.src = item.imagem; image.alt = item.titulo;
    document.querySelector('#article-body').innerHTML = renderBody(item);
    const sourceButton = document.querySelector('#article-source-button');
    if (sourceButton && item.url_fonte) { sourceButton.href = item.url_fonte; sourceButton.hidden = false; }
    const related = items.filter((news) => news.slug !== item.slug && news.categoria === item.categoria).slice(0, 3);
    const relatedList = document.querySelector('#related-news-list');
    if (relatedList && related.length) {
      relatedList.innerHTML = related.map((news) => `<li><a href="?slug=${encodeURIComponent(news.slug)}">${escapeHtml(news.titulo)}</a></li>`).join('');
      document.querySelector('#related-news').hidden = false;
    }
    configureSeo(item); article.hidden = false;
  } catch (error) {
    console.error(error);
    setMeta('meta[name="robots"]', 'noindex, follow');
    errorBox.hidden = false;
  }
}
init();
