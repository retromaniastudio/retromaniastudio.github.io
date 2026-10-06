import { initializeRouter } from "./router.js";
import { getSitioConfig } from "./services/sitio.js";
import { escapeHtml } from "./utils/noticias.js";

async function renderFooterSocials() {
    const container = document.querySelector("[data-footer-socials]");
    if (!container) return;

    try {
        const config = await getSitioConfig();
        const socials = Array.isArray(config.redes) ? config.redes : [];
        container.innerHTML = socials.map(social => {
            const name = String(social.nombre ?? "").trim();
            const icon = String(social.icono ?? "").trim();
            const url = String(social.url ?? "").trim();
            if (!icon || !url) return "";
            return `
                <a class="footer-social" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(name)}" title="${escapeHtml(name)}">
                    <img src="${escapeHtml(icon)}" alt="">
                </a>
            `;
        }).join("");
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeRouter();
    renderFooterSocials();
});
