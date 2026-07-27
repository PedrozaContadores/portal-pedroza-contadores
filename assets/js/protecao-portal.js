/**
 * Portal Pedroza Contadores - Camada de Protecao de Propriedade Intelectual
 * Versao 2.0.1
 * Esta camada dificulta incorporacao indevida e registra marcadores de autoria.
 * Ela nao substitui protecao juridica, controle de servidor ou monitoramento.
 */
(() => {
  'use strict';

  const OWNER = 'Pedroza Contadores';
  const SIGNATURE = 'PPC-PI-2026-2.0.1';

  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location.href;
    }
  } catch {
    window.location.replace(window.location.href);
  }

  Object.defineProperty(window, '__PEDROZA_PORTAL_SIGNATURE__', {
    value: Object.freeze({ owner: OWNER, signature: SIGNATURE }),
    configurable: false,
    enumerable: false,
    writable: false
  });

  const marker = document.createElement('meta');
  marker.name = 'portal-signature';
  marker.content = SIGNATURE;
  document.head.appendChild(marker);

  console.info(`%c${OWNER}`, 'font-weight:bold;font-size:16px');
  console.info('Conteudo, estrutura visual, bases de dados e funcionalidades protegidos por direitos autorais.');
})();
