# Sprint 1.9.1 — Hotfix Cabeçalho Glass

## Objetivo

Corrigir o desequilíbrio horizontal do cabeçalho após a inclusão do item Conteúdo Fiscal e aplicar o acabamento branco translúcido com efeito de vidro solicitado.

## Alterações

- Cabeçalho fixo em todas as páginas.
- Fundo branco translúcido com `backdrop-filter`.
- Sombra suave e borda institucional inferior.
- Telefone protegido contra quebra de linha.
- Espaçamentos responsivos entre 801 px e 1240 px.
- Botão Área do Cliente preservado e alinhado.
- Compensação de altura no corpo da página.
- Barras internas reposicionadas abaixo do cabeçalho.

## Arquivos alterados

- `assets/css/layout.css`
- `assets/css/responsive.css`
- `index.html`
- páginas HTML com referências de cache/versionamento
- `assets/js/utilities.js`
- `service-worker.js`
- `version.json`
- `docs/CHANGELOG.md`
- `docs/SPRINT-1.9.1-HOTFIX-CABECALHO-GLASS.md`

## Critérios de homologação

- Cabeçalho permanece visível durante a rolagem.
- Fundo apresenta transparência e desfoque sem prejudicar a leitura.
- Telefone não quebra em duas linhas.
- Menu e botão não ultrapassam a largura disponível.
- Menu mobile continua abrindo e fechando normalmente.
- Nenhum conteúdo ou funcionalidade da Sprint 1.9 é alterado.
