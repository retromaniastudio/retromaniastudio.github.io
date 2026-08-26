import {
    getNoticiasRecientes,
    getNoticiasAnteriores
} from "../services/noticias.js";

import {
    escapeHtml,
    formatNewsDate,
    resolveNewsImage,
    formatNewsContent
} from "../utils/noticias.js";


export async function renderNoticia(
    container,
    source,
    index
) {

    container.innerHTML = `
        <section class="home-loading">
            Cargando noticia...
        </section>
    `;


    try {

        const noticias =
            source === "anteriores"
                ? await getNoticiasAnteriores()
                : await getNoticiasRecientes();


        const noticia =
            noticias[index];


        if (!noticia) {

            container.innerHTML = `
                <section class="page-message">

                    <a
                        class="back-link"
                        href="${source === "anteriores"
                    ? "#anteriores"
                    : "#inicio"
                }"
                    >
                        ← Volver
                    </a>

                    <h1 class="page-title">
                        NOTICIA NO ENCONTRADA
                    </h1>

                </section>
            `;

            return;
        }


        const backUrl =
            source === "anteriores"
                ? "#anteriores"
                : "#inicio";


        container.innerHTML = `
            <article class="news-detail">

                <a
                    class="back-link"
                    href="${backUrl}"
                >
                    ← Volver
                </a>

                <p class="news-date">
                    ${formatNewsDate(noticia.fecha)}
                </p>

                <h1 class="news-detail__title">
                    ${escapeHtml(noticia.titulo)}
                </h1>

                <img
                    class="news-detail__image"
                    src="${resolveNewsImage(noticia.imagen)}"
                    alt=""
                    data-news-detail-image
                >

                <div class="news-detail__content">
                    ${formatNewsContent(noticia.contenido)}
                </div>

            </article>
        `;


        const image =
            container.querySelector(
                "[data-news-detail-image]"
            );


        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied
                ) {

                    return;
                }


                image.dataset.fallbackApplied =
                    "true";

                image.src =
                    "./img/general/logo.png";

            }
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <section class="page-message">

                <a
                    class="back-link"
                    href="#inicio"
                >
                    ← Volver
                </a>

                <h1 class="page-title">
                    ERROR
                </h1>

                <p>
                    No fue posible cargar esta noticia.
                </p>

            </section>
        `;
    }
}