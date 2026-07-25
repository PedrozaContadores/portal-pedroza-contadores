import { BUILD_INFORMATION } from "./modules/build-information.js";

function initializePortal() {
    const versionElements = document.querySelectorAll(
        "[data-build-version]"
    );

    versionElements.forEach((element) => {
        element.textContent = `Versão ${BUILD_INFORMATION.version}`;
    });

    document.documentElement.dataset.portalReady = "true";

    console.info(
        `${BUILD_INFORMATION.project} | ` +
        `Sprint ${BUILD_INFORMATION.sprint} | ` +
        `Versão ${BUILD_INFORMATION.version}`
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortal);
} else {
    initializePortal();
}
