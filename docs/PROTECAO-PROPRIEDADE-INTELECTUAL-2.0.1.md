# Protecao de Propriedade Intelectual - Versao 2.0.1

## Entregas aplicadas

- Marcadores de autoria em todas as paginas HTML.
- Script de protecao contra incorporacao indevida por iframe.
- Assinatura tecnica discreta no DOM e no objeto global do navegador.
- Pagina institucional de Termos de Uso e Propriedade Intelectual.
- Arquivo `security.txt`.
- Regras de cabecalho preparadas para Cloudflare Pages/Netlify.
- Validacao automatica no GitHub Actions.
- Versao atualizada para 2.0.1.
- Backup externo ao repositorio antes da instalacao.

## Limites tecnicos

Codigo HTML, CSS e JavaScript entregue ao navegador nunca pode ser tornado absolutamente incopiavel. A camada implementada aumenta a dificuldade, registra autoria e reduz incorporacao indevida. Logica realmente sigilosa deve ser transferida futuramente para uma API privada ou funcao serverless.

## Nao aplicado propositalmente

- Bloqueio de botao direito.
- Bloqueio de selecao de texto.
- Bloqueio de F12.
- Ofuscacao agressiva em producao sem etapa de build controlada.

Essas medidas prejudicam acessibilidade, sao facilmente burladas ou podem causar falhas no portal.
