import { renderInicio } from "./views/inicio.js";
import { renderColeccionables } from "./views/coleccionables.js";
import { renderPedidos } from "./views/pedidos.js";
import { renderNoticiasAnteriores } from "./views/noticiasAnteriores.js";
import { renderNoticia } from "./views/noticia.js";

const staticRoutes = {
    inicio: { render: renderInicio, title: "Inicio | Retromanía Studio", navigation: "inicio" },
    coleccionables: { render: renderColeccionables, title: "Coleccionables | Retromanía Studio", navigation: "coleccionables" },
    pedidos: { render: renderPedidos, title: "Pedidos | Retromanía Studio", navigation: "pedidos" },
    anteriores: { render: renderNoticiasAnteriores, title: "Noticias anteriores | Retromanía Studio", navigation: "inicio" }
};

function parseCurrentRoute() {
    const hash = window.location.hash.replace("#", "").trim();
    const normalized = hash.toLowerCase();
    if (!normalized) return { type: "static", name: "inicio" };

    const parts = hash.split("/");
    const first = (parts[0] ?? "").toLowerCase();

    if (
        first === "noticia" &&
        ["recientes", "anteriores"].includes((parts[1] ?? "").toLowerCase()) &&
        /^\d+$/.test(parts[2] ?? "")
    ) {
        return { type: "noticia", source: parts[1].toLowerCase(), index: Number(parts[2]) };
    }

    if (first === "coleccionables" && parts[1]) {
        return { type: "collection", slug: decodeURIComponent(parts.slice(1).join("/")) };
    }

    if (Object.hasOwn(staticRoutes, normalized)) return { type: "static", name: normalized };
    return { type: "static", name: "inicio" };
}

function updateActiveNavigation(routeName) {
    document.querySelectorAll(".main-navigation__link").forEach(link => {
        const isActive = link.dataset.route === routeName;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

async function renderCurrentRoute() {
    const container = document.getElementById("app-content");
    if (!container) return;

    const route = parseCurrentRoute();
    container.innerHTML = "";

    if (route.type === "noticia") {
        await renderNoticia(container, route.source, route.index);
        updateActiveNavigation("inicio");
        document.title = "Noticia | Retromanía Studio";
    } else if (route.type === "collection") {
        await renderColeccionables(container, route.slug);
        updateActiveNavigation("coleccionables");
        document.title = "Coleccionables | Retromanía Studio";
    } else {
        const staticRoute = staticRoutes[route.name];
        await staticRoute.render(container);
        updateActiveNavigation(staticRoute.navigation);
        document.title = staticRoute.title;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
}

export function initializeRouter() {
    if (!window.location.hash) window.history.replaceState(null, "", "#inicio");
    renderCurrentRoute();
    window.addEventListener("hashchange", renderCurrentRoute);
}
