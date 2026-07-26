const state = { noticias: [], categoria: 'Todas', busca: '' };

const list = document.querySelector('#news-list');
const filters = document.querySelector('#news-filters');
const search = document.querySelector('#news-search');
const empty = document.querySelector('#news-empty');
const resultCount = document.querySelector('#news-result-count');

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${date}T12:00:00Z`));

function filteredNews() {
  const term = normalize(state.busca.trim());
  return state.noticias.filter((item) => {
    const sameCategory = state.categoria === 'Todas' || item.categoria === state.categoria;
    const searchable = normalize(`${item.titulo} ${item.resumo} ${item.categoria} ${item.fonte} ${(item.conteudo || []).join(' ')}`);
    return sameCategory && (!term || searchable.includes(term));
  });
}

function renderFilters() {
  const categories = ['Todas', ...new Set(state.noticias.map((item) => item.categoria))];
  filters.innerHTML = categories.map((category) => `
    <button class="news-filter${category === state.categoria ? ' is-active' : ''}" type="button" data-category="${category}">${category}</button>
  `).join('');
}

function renderNews() {
  const items = filteredNews();
  resultCount.textContent = `${items.length} ${items.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}`;
  empty.hidden = items.length > 0;
  list.hidden = items.length === 0;
  list.innerHTML = items.map((item) => `
    <article class="news-list-card">
      <img src="${item.imagem}" alt="" loading="lazy" decoding="async" width="640" height="360">
      <div class="news-list-card__body">
        <div class="news-list-card__meta">
          <span class="news-list-card__category">${item.categoria}</span>
          <time datetime="${item.data}">${formatDate(item.data)}</time>
        </div>
        <h3>${item.titulo}</h3>
        <p>${item.resumo}</p>
        <a href="../noticia/?slug=${encodeURIComponent(item.slug)}" aria-label="Ler ${item.titulo}">Ler notícia &rarr;</a>
      </div>
    </article>
  `).join('');
}

filters?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.categoria = button.dataset.category;
  renderFilters();
  renderNews();
});

search?.addEventListener('input', () => {
  state.busca = search.value;
  renderNews();
});

async function init() {
  try {
    const response = await fetch('../../data/noticias.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar notícias: ${response.status}`);
    state.noticias = (await response.json()).sort((a, b) => b.data.localeCompare(a.data));
    renderFilters();
    renderNews();
  } catch (error) {
    console.error(error);
    resultCount.textContent = 'Não foi possível carregar as notícias.';
    empty.hidden = false;
    list.hidden = true;
  }
}

init();