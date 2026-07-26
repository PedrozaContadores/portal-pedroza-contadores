# Sprint 1.10 — Biblioteca Tributária Inteligente (BTI)

## Objetivo
Transformar a Biblioteca de Legislação em uma base dinâmica, pesquisável e integrada ao ecossistema tributário do portal.

## Entregas
- Base `data/legislacao.json` com 17 fontes oficiais.
- Renderização dinâmica dos cards e filtros pelo JavaScript.
- Pesquisa por norma, sigla, órgão, referência, assunto e tags.
- Integrações contextuais com Conteúdo Fiscal e Calculadoras.
- Atualização dos endereços oficiais do SPED, Receita Federal e eSocial.
- Cache offline versionado e inclusão da base JSON no Service Worker.
- Tratamento de carregamento, falha e pesquisa sem resultados.
- Layout, cabeçalho, rodapé e identidade visual preservados.

## Critérios para homologação
1. Abrir a página Legislação no desktop e celular.
2. Confirmar carregamento dos 17 cards.
3. Testar pesquisa por `CBS`, `DCTFWeb`, `eSocial` e `NFS-e`.
4. Testar todos os filtros.
5. Abrir uma fonte oficial, um conteúdo relacionado e uma calculadora relacionada.
6. Confirmar versão 1.10.0 no rodapé.
