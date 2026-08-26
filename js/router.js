import {
    renderInicio
} from "./views/inicio.js";

import {
    renderChecklist
} from "./views/checklist.js";

import {
    renderPedidos
} from "./views/pedidos.js";

import {
    renderNoticiasAnteriores
} from "./views/noticiasAnteriores.js";

import {
    renderNoticia
} from "./views/noticia.js";


const staticRoutes = {

    inicio: {
        render: renderInicio,
        title: "Inicio | Retromania Studio",
        navigation: "inicio"
    },

    checklist: {
        render: renderChecklist,
        title: "Checklist | Retromania Studio",
        navigation: "checklist"
    },

    pedidos: {
        render: renderPedidos,
        title: "Pedidos | Retromania Studio",
        navigation: "pedidos"
    },

    anteriores: {
        render: renderNoticiasAnteriores,
        title: "Noticias anteriores | Retromania Studio",
        navigation: "inicio"
    }

};


function parseCurrentRoute() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim()
            .toLowerCase();


    if (!hash) {

        return {
            type: "static",
            name: "inicio"
        };
    }


    const parts =
        hash.split("/");


    /*
     * Rutas:
     *
     * #noticia/recientes/0
     * #noticia/anteriores/3
     */

    if (
        parts[0] === "noticia"
        && (
            parts[1] === "recientes"
            || parts[1] === "anteriores"
        )
        && /^\d+$/.test(parts[2] ?? "")
    ) {

        return {
            type: "noticia",
            source: parts[1],
            index: Number(parts[2])
        };
    }


    if (
        Object.hasOwn(
            staticRoutes,
            hash
        )
    ) {

        return {
            type: "static",
            name: hash
        };
    }


    return {
        type: "static",
        name: "inicio"
    };
}


function updateActiveNavigation(
    routeName
) {

    const links =
        document.querySelectorAll(
            ".main-navigation__link"
        );


    links.forEach(
        (link) => {

            const isActive =
                link.dataset.route === routeName;


            link.classList.toggle(
                "is-active",
                isActive
            );


            if (isActive) {

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.removeAttribute(
                    "aria-current"
                );
            }

        }
    );
}


async function renderCurrentRoute() {

    const container =
        document.getElementById(
            "app-content"
        );


    if (!container) {

        console.error(
            "No se encontró el contenedor #app-content."
        );

        return;
    }


    const route =
        parseCurrentRoute();


    container.innerHTML = "";


    if (
        route.type === "noticia"
    ) {

        await renderNoticia(
            container,
            route.source,
            route.index
        );


        updateActiveNavigation(
            "inicio"
        );


        document.title =
            "Noticia | Retromania Studio";


        return;
    }


    const staticRoute =
        staticRoutes[route.name];


    await staticRoute.render(
        container
    );


    updateActiveNavigation(
        staticRoute.navigation
    );


    document.title =
        staticRoute.title;
}


export function initializeRouter() {

    if (!window.location.hash) {

        window.history.replaceState(
            null,
            "",
            "#inicio"
        );
    }


    renderCurrentRoute();


    window.addEventListener(
        "hashchange",
        renderCurrentRoute
    );
}