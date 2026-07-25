import { BUILD_INFORMATION } from "./modules/build-information.js";

function initializePortal() {
  document.querySelectorAll("[data-build-version]").forEach((element) => {
    element.textContent = `Versão ${BUILD_INFORMATION.version}`;
  });

  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  document.documentElement.dataset.portalReady = "true";
  console.info(`${BUILD_INFORMATION.project} | Sprint ${BUILD_INFORMATION.sprint} | Versão ${BUILD_INFORMATION.version}`);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", initializePortal)
  : initializePortal();
