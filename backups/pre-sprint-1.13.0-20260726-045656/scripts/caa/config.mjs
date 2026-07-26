export const CAA_VERSION = '1.12.2';
export const DATASETS = [
  { id: 'biblioteca-tributaria', file: 'data/legislacao.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'agenda-tributaria', file: 'data/agenda-tributaria.json', required: false, kind: 'object-list', listKey: 'itens' },
  { id: 'conteudo-fiscal', file: 'data/conteudo-fiscal.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'noticias', file: 'data/noticias.json', required: true, kind: 'array' }
];
export const OFFICIAL_HOSTS = [
  'gov.br', 'planalto.gov.br', 'receita.fazenda.gov.br', 'receita.economia.gov.br',
  'economia.gov.br', 'fazenda.rj.gov.br', 'rj.gov.br', 'rio.rj.gov.br',
  'cfc.org.br', 'crcrj.org.br', 'ebc.com.br', 'agenciabrasil.ebc.com.br',
  'senado.leg.br', 'camara.leg.br', 'stf.jus.br', 'stj.jus.br', 'tst.jus.br',
  'tse.jus.br', 'trf2.jus.br', 'tjrj.jus.br', 'carf.economia.gov.br'
];
export const LINK_TIMEOUT_MS = 15000;
