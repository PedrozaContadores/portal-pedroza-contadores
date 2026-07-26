# Sprint 1.9.2 — Hotfix Navegação Legislação

## Objetivo
Separar definitivamente os destinos “Legislação” e “Links Úteis” no menu principal.

## Alterações
- Nova página `pages/legislacao/index.html`.
- Link “Legislação” direcionado para a nova rota em todo o portal.
- Link “Links Úteis” mantido em `pages/utilidades/#links-oficiais`.
- Estado ativo do menu corrigido na página de Utilidades.
- Versão atualizada para 1.9.2.
- Sitemap e Service Worker atualizados.

## Critérios de validação
1. “Legislação” abre `/pages/legislacao/`.
2. “Links Úteis” abre `/pages/utilidades/#links-oficiais`.
3. Os dois itens não direcionam mais para o mesmo endereço.
4. Cabeçalho glass e layout homologado permanecem inalterados.
