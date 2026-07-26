(() => {
  const meses = ["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const nomes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const agora = new Date();
  const ano = agora.getFullYear();
  const indice = agora.getMonth();
  const mesUrl = meses[indice];
  const link = document.getElementById("agenda-link-mes");
  const texto = document.getElementById("agenda-mes-atual");
  if (link) {
    link.href = `https://www.gov.br/receitafederal/pt-br/assuntos/agenda-tributaria/${ano}/${mesUrl}`;
    link.textContent = `Consultar ${nomes[indice]} de ${ano} ↗`;
  }
  if (texto) texto.textContent = `Vencimentos oficiais da Receita Federal para ${nomes[indice]} de ${ano}.`;
})();
