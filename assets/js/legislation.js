(() => {
  const search = document.querySelector('#legislation-search');
  const grid = document.querySelector('#legislation-grid');
  const count = document.querySelector('#legislation-count');
  const empty = document.querySelector('#legislation-empty');
  const status = document.querySelector('#legislation-status');
  const filtersRoot = document.querySelector('#legislation-filters');
  if (!search || !grid || !filtersRoot) return;

  const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const formatDate = (value) => {
    if (!value) return 'Verificação automática ativa';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  };
  const calcLabels = {simples:'Simples Nacional',presumido:'Lucro Presumido',comparativo:'Comparativo de regimes',ferias:'Férias',decimo:'13º salário','custo-funcionario':'Custo do funcionário'};
  let items = [];
  let category = 'todos';

  const relatedLinks = (item) => {
    const contentIds = item.relacionados?.conteudo || [];
    const calculatorIds = item.relacionados?.calculadoras || [];
    const content = contentIds.length
      ? `<a class="button button--outline" href="../conteudo-fiscal/?q=${encodeURIComponent(contentIds[0])}">Ver conteúdos relacionados →</a>`
      : '';
    const calculators = calculatorIds.map((id) => `<a class="legislation-related-link" href="../inteligencia-tributaria/#calc-${encodeURIComponent(id)}">Calcular: ${escapeHtml(calcLabels[id] || id)} →</a>`);
    return [content, ...calculators].join('');
  };

  const cardTemplate = (item) => {
    const relatedCount = (item.relacionados?.conteudo || []).length + (item.relacionados?.calculadoras || []).length;
    return `<article class="legislation-card" data-category="${escapeHtml(item.categoria)}" data-search="${escapeHtml([item.titulo,item.sigla,item.categoriaNome,item.descricao,item.orgao,item.referencia,item.tipo,item.esfera,item.status,...(item.tags||[])].join(' '))}">
      <div class="legislation-card-top"><span class="legislation-icon">${escapeHtml(item.sigla)}</span><div class="legislation-card-badges"><span class="legislation-sphere">${escapeHtml(item.esfera || 'Federal')}</span><span class="legislation-tag">${escapeHtml(item.categoriaNome)}</span></div></div>
      <div class="legislation-card-body"><h3>${escapeHtml(item.titulo)}</h3><p>${escapeHtml(item.descricao)}</p></div>
      <div class="legislation-meta"><span>${escapeHtml(item.tipo || item.orgao)}</span><span>${escapeHtml(item.referencia)}</span></div>
      <div class="legislation-trust"><span><strong>Status:</strong> ${escapeHtml(item.status || 'Consulta oficial')}</span><span><strong>Atualizado:</strong> ${escapeHtml(formatDate(item.ultimaAtualizacao))}</span><span><strong>Fonte:</strong> oficial</span>${relatedCount ? `<span><strong>${relatedCount}</strong> recurso${relatedCount > 1 ? 's' : ''} relacionado${relatedCount > 1 ? 's' : ''}</span>` : ''}</div>
      <div class="legislation-actions"><a class="button button--primary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a>${relatedLinks(item)}</div>
    </article>`;
  };

  const searchableText = (item) => [item.titulo,item.sigla,item.categoriaNome,item.descricao,item.orgao,item.referencia,item.tipo,item.esfera,item.status,...(item.tags||[])].join(' ');

  const apply = () => {
    const term = normalize(search.value.trim());
    const visible = items.filter((item) => (category === 'todos' || item.categoria === category) && (!term || normalize(searchableText(item)).includes(term)));
    grid.innerHTML = visible.map(cardTemplate).join('');
    count.textContent = String(visible.length);
    empty.hidden = visible.length !== 0;
  };

  const renderFilters = (categories) => {
    filtersRoot.innerHTML = categories.map((item) => `<button class="legislation-filter${item.id === 'todos' ? ' is-active' : ''}" data-legislation-filter="${escapeHtml(item.id)}" type="button">${escapeHtml(item.nome)}</button>`).join('');
    filtersRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-legislation-filter]'); if (!button) return;
      category = button.dataset.legislationFilter;
      filtersRoot.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    });
  };

  fetch('../../data/legislacao.json', {cache:'no-store'}).then((response) => { if (!response.ok) throw new Error('Falha ao carregar a base'); return response.json(); }).then((data) => {
    items = Array.isArray(data.itens) ? data.itens : [];
    renderFilters(data.categorias || [{id:'todos',nome:'Todos'}]);
    status.hidden = true; apply();
  }).catch(() => { status.textContent = 'Não foi possível carregar a biblioteca. Atualize a página para tentar novamente.'; status.classList.add('is-error'); });

  search.addEventListener('input', apply);
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; apply(); search.blur(); }
  });
})();
