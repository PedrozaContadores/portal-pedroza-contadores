(() => {
  const search = document.querySelector('#legislation-search');
  const grid = document.querySelector('#legislation-grid');
  const count = document.querySelector('#legislation-count');
  const empty = document.querySelector('#legislation-empty');
  const filters = [...document.querySelectorAll('[data-legislation-filter]')];
  if (!search || !grid) return;
  const cards = [...grid.querySelectorAll('[data-legislation-card]')];
  let category = 'todos';
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const apply = () => {
    const term = normalize(search.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const matchesText = !term || normalize(card.dataset.search || card.textContent).includes(term);
      const matchesCategory = category === 'todos' || card.dataset.category === category;
      const show = matchesText && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    });
    count.textContent = String(visible);
    empty.hidden = visible !== 0;
  };
  filters.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.legislationFilter;
    filters.forEach((item) => item.classList.toggle('is-active', item === button));
    apply();
  }));
  search.addEventListener('input', apply);
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; apply(); search.blur(); }
  });
  apply();
})();
