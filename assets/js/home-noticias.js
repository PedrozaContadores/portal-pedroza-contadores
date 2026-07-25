const grid = document.querySelector('#home-news-grid');

const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${date}T12:00:00Z`));

async function loadHomeNews() {
  if (!grid) return;
  try {
    const response = await fetch('data/noticias.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const items = (await response.json())
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 3);
    if (!items.length) return;
    grid.innerHTML = items.map((item) => `
      <article class="news-card">
        <div class="news-image"><img src="${escapeHtml(item.imagem.replace(/^\.\.\/\.\.\//, ''))}" alt="${escapeHtml(item.titulo)}" loading="lazy" decoding="async" width="640" height="312"></div>
        <div class="news-body">
          <div class="news-meta"><span>${escapeHtml(item.categoria)}</span><time datetime="${escapeHtml(item.data)}">${formatDate(item.data)}</time></div>
          <h3>${escapeHtml(item.titulo)}</h3>
          <p>${escapeHtml(item.resumo)}</p>
          <a href="pages/noticia/?slug=${encodeURIComponent(item.slug)}">Ler mais &rarr;</a>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.warn('Noticias da Home mantidas em modo estatico.', error);
  }
}

loadHomeNews();
