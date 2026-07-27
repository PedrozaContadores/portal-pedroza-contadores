# Regras recomendadas para Cloudflare

## Cabecalhos de resposta

Criar uma regra de transformacao para aplicar:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; form-action 'self'; upgrade-insecure-requests`

## Protecao contra bots

1. Ativar Bot Fight Mode, quando disponivel.
2. Criar limite para requisicoes repetidas a `/data/*`.
3. Desafiar acessos com volume anormal a arquivos `.json`.
4. Manter liberados mecanismos de busca reconhecidos.

## Observacao

Aplicar primeiro em modo de teste. Uma CSP muito restritiva pode bloquear fontes, imagens ou integracoes externas. Validar o portal completo antes de tornar a regra definitiva.
