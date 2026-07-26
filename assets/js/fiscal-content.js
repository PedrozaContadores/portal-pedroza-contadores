(() => {
  const grid = document.querySelector('#fiscal-grid');
  if (!grid) return;
  const search = document.querySelector('#fiscal-search');
  const filters = document.querySelector('#fiscal-categories');
  const count = document.querySelector('#fiscal-count');
  const empty = document.querySelector('#fiscal-empty');
  let items = []; let category = 'Todos';
  const normalize = (value='') => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const escapeHtml = (value='') => value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  function card(item){ return `<article class="fiscal-card"><div class="fiscal-card-head"><span class="fiscal-card-icon">${escapeHtml(item.sigla)}</span><div><span class="fiscal-card-category">${escapeHtml(item.categoria)}</span><h3>${escapeHtml(item.titulo)}</h3></div></div><div class="fiscal-card-body"><p class="fiscal-card-summary">${escapeHtml(item.resumo)}</p><ul class="fiscal-points">${item.pontos.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul><div class="fiscal-source"><small>Fonte: ${escapeHtml(item.orgao)}</small><a class="button button--primary" href="${encodeURI(item.fonte)}" target="_blank" rel="noopener noreferrer">Acessar fonte oficial ↗</a></div></div></article>`; }
  function render(){ const term=normalize(search.value); const shown=items.filter(item=>{ const inCategory=category==='Todos'||item.categoria===category; const haystack=normalize([item.titulo,item.categoria,item.sigla,item.resumo,item.orgao,...item.tags].join(' ')); return inCategory && (!term||haystack.includes(term)); }); grid.innerHTML=shown.map(card).join(''); count.textContent=shown.length; empty.hidden=shown.length!==0; }
  function setCategory(value){ category=value; [...filters.children].forEach(button=>button.classList.toggle('is-active',button.dataset.category===value)); render(); }
  fetch('../../data/conteudo-fiscal.json').then(r=>{if(!r.ok) throw new Error(); return r.json();}).then(data=>{items=data.itens; const categories=['Todos',...new Set(items.map(i=>i.categoria))]; filters.innerHTML=categories.map(c=>`<button class="fiscal-filter${c==='Todos'?' is-active':''}" type="button" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join(''); filters.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setCategory(b.dataset.category)}); const requested=new URLSearchParams(location.search).get('categoria'); if(requested&&categories.includes(requested))setCategory(requested); else render();}).catch(()=>{empty.hidden=false;empty.querySelector('strong').textContent='Não foi possível carregar a biblioteca.';});
  search.addEventListener('input',render); document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();}});
})();