export const CAA_VERSION = '2.0.0';
export const DATASETS = [
  { id: 'biblioteca-tributaria', file: 'data/legislacao.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'agenda-tributaria', file: 'data/agenda-tributaria.json', required: false, kind: 'object-list', listKey: 'itens' },
  { id: 'certidoes', file: 'data/certidoes.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'obrigacoes', file: 'data/obrigacoes.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'conteudo-fiscal', file: 'data/conteudo-fiscal.json', required: true, kind: 'object-list', listKey: 'itens' },
  { id: 'noticias', file: 'data/noticias.json', required: true, kind: 'array' },
  { id: 'formularios', file: 'data/formularios.json', kind: 'object', listKey: 'itens', required: true },
  { id: 'tabelas', file: 'data/tabelas.json', kind: 'object', listKey: 'itens', required: true },
  { id: 'pesquisa-global', file: 'data/pesquisa-global.json', kind: 'object', listKey: 'itens', required: true },
];
export const OFFICIAL_HOSTS = [
  'gov.br', 'planalto.gov.br', 'receita.fazenda.gov.br', 'receita.economia.gov.br',
  'economia.gov.br', 'fazenda.rj.gov.br', 'rj.gov.br', 'rio.rj.gov.br',
  'cfc.org.br', 'crcrj.org.br', 'ebc.com.br', 'agenciabrasil.ebc.com.br',
  'senado.leg.br', 'camara.leg.br', 'stf.jus.br', 'stj.jus.br', 'tst.jus.br',
  'caixa.gov.br', 'fgts.gov.br', 'sistema.gov.br', 'sped.rfb.gov.br', 'cjf.jus.br', 'trt1.jus.br', 'crc.org.br', 'tse.jus.br', 'trf2.jus.br', 'carioca.rio', 'b3.com.br', 'prefeitura.rio', 'tjrj.jus.br', 'carf.economia.gov.br'
];
export const LINK_TIMEOUT_MS = 15000;
