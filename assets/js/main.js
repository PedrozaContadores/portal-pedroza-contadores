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

  const header = document.querySelector(".site-header");
  const backTop = document.querySelector(".back-top");
  const updateScrollState = () => {
    const scrolled = window.scrollY > 24;
    header?.classList.toggle("is-scrolled", scrolled);
    backTop?.classList.toggle("is-visible", window.scrollY > 420);
  };
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || 0);
    const prefix = element.dataset.prefix || "";
    const locale = element.dataset.format || "pt-BR";
    const duration = 1100;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = `${prefix}${value.toLocaleString(locale)}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterElements = document.querySelectorAll("[data-counter]");
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      animateCounter(element);
      observer.unobserve(element);
    });
    }, { threshold: 0.7 });
    counterElements.forEach((element) => counterObserver.observe(element));
  } else {
    counterElements.forEach(animateCounter);
  }

  document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
    link.setAttribute("tabindex", "-1");
    link.setAttribute("title", "Funcionalidade preparada para uma etapa futura");
    link.addEventListener("click", (event) => event.preventDefault());
  });

  document.documentElement.dataset.portalReady = "true";
  console.info(`${BUILD_INFORMATION.project} | Sprint ${BUILD_INFORMATION.sprint} | Versão ${BUILD_INFORMATION.version}`);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", initializePortal)
  : initializePortal();
