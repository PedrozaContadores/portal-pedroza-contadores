(() => {
  const state = { services: [], categories: [], query: "", category: "all" };
  const normalize = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const escapeHtml = (value = "") => value.replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const els = {
    search: document.getElementById("utility-search"), clear: document.getElementById("clear-search"), count: document.getElementById("result-count"), active: document.getElementById("active-filter"), catalog: document.getElementById("utilities-catalog"), empty: document.getElementById("utility-empty"), reset: document.getElementById("reset-filters"), popular: document.getElementById("popular-grid"), shortcuts: document.getElementById("category-shortcuts"), filters: document.getElementById("category-filter-bar")
  };
  function card(service) {
    return `<article class="utility-card" data-service-id="${service.id}"><div class="utility-card-head"><img class="utility-logo" src="${service.logo}" alt="Identidade visual de ${escapeHtml(service.organization)}" loading="lazy" width="82" height="56" onerror="this.src='../../assets/images/orgaos/governo-federal.svg'"><div><h3>${escapeHtml(service.name)}</h3><span class="utility-org">${escapeHtml(service.organization)}</span></div></div><p>${escapeHtml(service.description)}</p><div class="utility-card-meta"><span class="official-badge">✓ Portal Oficial</span><span class="new-tab-badge">↗ Abre em nova aba</span></div><a class="button button--primary" href="${service.url}" target="_blank" rel="noopener noreferrer" aria-label="Acessar ${escapeHtml(service.name)} em nova aba">Acessar Portal Oficial ↗</a></article>`;
  }
  function popularCard(service) { return `<a class="popular-card" href="${service.url}" target="_blank" rel="noopener noreferrer"><img src="${service.logo}" alt="Identidade visual de ${escapeHtml(service.organization)}" width="62" height="50" onerror="this.src='../../assets/images/orgaos/governo-federal.svg'"><span><strong>${escapeHtml(service.name)}</strong><small>Portal Oficial ↗</small></span></a>`; }
  function setCategory(category, scroll = false) { state.category = category; document.querySelectorAll('[data-category-filter]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.categoryFilter === category)); render(); if (scroll) document.querySelector('.utility-search-panel')?.scrollIntoView({behavior:'smooth',block:'start'}); }
  function renderFilters() {
    const buttons = [{id:'all',label:'Todos',icon:'⌂'}, ...state.categories].map(c => `<button type="button" data-category-filter="${c.id}">${c.icon || ''} ${escapeHtml(c.label)}</button>`).join('');
    els.shortcuts.innerHTML = buttons; els.filters.innerHTML = buttons;
    document.querySelectorAll('[data-category-filter]').forEach(btn => btn.addEventListener('click', () => setCategory(btn.dataset.categoryFilter, true)));
  }
  function render() {
    const query = normalize(state.query); const current = state.categories.find(c => c.id === state.category);
    const filtered = state.services.filter(service => { const categoryOk = state.category === 'all' || service.category === state.category; const haystack = normalize([service.name,service.organization,service.description,service.categoryLabel,service.abbr,service.keywords].join(' ')); return categoryOk && (!query || haystack.includes(query)); });
    const grouped = state.categories.map(category => ({category,services:filtered.filter(service => service.category === category.id)})).filter(group => group.services.length);
    els.catalog.innerHTML = grouped.map(({category,services}) => `<section class="utility-section" id="categoria-${category.id}"><div class="utility-category-header"><div class="utility-category-title"><span class="utility-category-icon" aria-hidden="true">${category.icon}</span><div><h2>${escapeHtml(category.label)}</h2><p>${escapeHtml(category.description)}</p></div></div><span class="utility-category-count">${services.length} serviço${services.length === 1 ? '' : 's'}</span></div><div class="utility-grid">${services.map(card).join('')}</div></section>`).join('');
    els.empty.hidden = filtered.length > 0; els.count.textContent = `${filtered.length} serviço${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`; els.active.textContent = current ? current.label : 'Todos os serviços oficiais'; els.clear.hidden = !state.query; document.querySelectorAll('[data-category-filter]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.categoryFilter === state.category));
  }
  function setupAgenda(){ const mesesUrl=["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"], nomes=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"], agora=new Date(), ano=agora.getFullYear(), indice=agora.getMonth(), link=document.getElementById('agenda-link-mes'), texto=document.getElementById('agenda-mes-atual'); if(link){link.href=`https://www.gov.br/receitafederal/pt-br/assuntos/agenda-tributaria/${ano}/${mesesUrl[indice]}`;link.textContent=`Consultar ${nomes[indice]} de ${ano} ↗`;} if(texto) texto.textContent=`Vencimentos oficiais da Receita Federal para ${nomes[indice]} de ${ano}.`; }
  function applyHashNavigation() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'certidoes' || hash === 'categoria-certidoes') {
      setCategory('certidoes');
      requestAnimationFrame(() => document.getElementById('categoria-certidoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    if (hash.startsWith('categoria-')) {
      const category = hash.replace('categoria-', '');
      if (state.categories.some((item) => item.id === category)) setCategory(category);
    }
  }
  async function init(){ try { const response=await fetch('../../data/utilities.json?v=1.12.1',{cache:'no-store'}); if(!response.ok) throw new Error('Falha ao carregar base'); const data=await response.json(); state.services=data.services; state.categories=data.categories; renderFilters(); els.popular.innerHTML=state.services.filter(s=>s.featured).slice(0,8).map(popularCard).join(''); render(); applyHashNavigation(); } catch(error){ els.count.textContent='Não foi possível carregar os serviços.'; els.empty.hidden=false; console.error(error); } }
  window.addEventListener('hashchange', applyHashNavigation);
  els.search?.addEventListener('input',event=>{state.query=event.target.value;render();}); els.clear?.addEventListener('click',()=>{state.query='';els.search.value='';els.search.focus();render();}); els.reset?.addEventListener('click',()=>{state.query='';state.category='all';els.search.value='';render();}); setupAgenda(); init();
})();
