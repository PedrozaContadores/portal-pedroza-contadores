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
  const icons = {
    source: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M12 3l9 5H3l9-5Z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1m3.1 5.9a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
    calculator: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6V3Zm3 3h6v3H9V6Zm0 7h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01"/></svg>',
    update: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8m0-5v5h-5"/></svg>'
  };
  const calcLabels = {simples:'Simples Nacional',presumido:'Lucro Presumido',comparativo:'Comparativo de regimes',ferias:'Férias',decimo:'13º salário','custo-funcionario':'Custo do funcionário'};
  let items = [];
  let category = 'todos';

  const relatedLinks = (item) => {
    const contentIds = item.relacionados?.conteudo || [];
    const calculatorIds = item.relacionados?.calculadoras || [];
    const content = contentIds.length
      ? `<a class="button button--outline" href="../conteudo-fiscal/?q=${encodeURIComponent(contentIds[0])}">${icons.link}<span>Ver conteúdos relacionados</span><span aria-hidden="true">→</span></a>`
      : '';
    const calculators = calculatorIds.map((id) => `<a class="legislation-related-link" href="../inteligencia-tributaria/#calc-${encodeURIComponent(id)}">${icons.calculator}<span>Calcular: ${escapeHtml(calcLabels[id] || id)}</span><span aria-hidden="true">→</span></a>`);
    return [content, ...calculators].join('');
  };

  const cardTemplate = (item) => {
    const relatedCount = (item.relacionados?.conteudo || []).length + (item.relacionados?.calculadoras || []).length;
    const statusLabel = String(item.status || 'Consulta oficial').split('/')[0].trim();
    return `<article class="legislation-card" data-category="${escapeHtml(item.categoria)}" data-search="${escapeHtml(searchableText(item))}">
      <div class="legislation-card-top"><span class="legislation-icon">${escapeHtml(item.sigla)}</span><div class="legislation-card-badges"><span class="legislation-sphere">${escapeHtml(item.esfera || 'Federal')}</span><span class="legislation-tag">${escapeHtml(item.categoriaNome)}</span></div></div>
      <div class="legislation-card-body"><h3>${escapeHtml(item.titulo)}</h3><p>${escapeHtml(item.descricao)}</p></div>
      <div class="legislation-meta"><span>${escapeHtml(item.tipo || item.orgao)}</span><span>${escapeHtml(item.referencia)}</span></div>
      <div class="legislation-trust">
        <span class="legislation-status-badge"><i aria-hidden="true"></i>${escapeHtml(statusLabel)}</span>
        <span class="legislation-trust-item">${icons.calendar}<span><strong>Atualizado em</strong>${escapeHtml(formatDate(item.ultimaAtualizacao))}</span></span>
        <span class="legislation-trust-item">${icons.source}<span><strong>Fonte</strong>Oficial</span></span>
        <span class="legislation-trust-item legislation-last-change">${icons.update}<span><strong>Última alteração</strong>${escapeHtml(item.ultimaAlteracao || 'Consulte o texto oficial')}</span></span>
        ${relatedCount ? `<span class="legislation-trust-item">${icons.link}<span><strong>${relatedCount}</strong> conteúdo${relatedCount > 1 ? 's' : ''} relacionado${relatedCount > 1 ? 's' : ''}</span></span>` : ''}
      </div>
      <div class="legislation-actions"><a class="button button--primary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a>${relatedLinks(item)}</div>
    </article>`;
  };

  function searchableText(item) {
    return [item.titulo,item.sigla,item.categoriaNome,item.descricao,item.orgao,item.referencia,item.tipo,item.esfera,item.status,item.ultimaAlteracao,...(item.tags||[]),...(item.palavrasChaveIA||[])].join(' ');
  }

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
