import {
    getNoticiasAnteriores
} from "../services/noticias.js";

import {
    escapeHtml,
    formatNewsDate
} from "../utils/noticias.js";


export async function renderNoticiasAnteriores(
    container
) {

    container.innerHTML = `
        <section class="home-loading">
            Cargando noticias anteriores...
        </section>
    `;


    try {

        const noticias =
            await getNoticiasAnteriores();


        const indexedNoticias =
            noticias
                .map(
                    (noticia, index) => ({
                        noticia,
                        index
                    })
                )
                .sort(
                    (a, b) =>
                        new Date(b.noticia.fecha)
                        - new Date(a.noticia.fecha)
                );


        const rows =
            indexedNoticias.length > 0
                ? indexedNoticias
                    .map(
                        ({ noticia, index }) => `
                            <article class="archive-news-item">

                                <div class="archive-news-item__information">

                                    <p class="news-date">
                                        ${formatNewsDate(noticia.fecha)}
                                    </p>

                                    <h2 class="archive-news-item__title">
                                        ${escapeHtml(noticia.titulo)}
                                    </h2>

                                </div>

                                <a
                                    class="news-more-link"
                                    href="#noticia/anteriores/${index}"
                                >
                                    Más...
                                </a>

                            </article>
                        `
                    )
                    .join("")
                : `
                    <div class="news-empty">
                        Aún no hay noticias anteriores.
                    </div>
                `;


        container.innerHTML = `
            <section class="archive-page">

                <a
                    class="back-link"
                    href="#inicio"
                >
                    ← Volver a Inicio
                </a>

                <h1 class="page-title">
                    NOTICIAS ANTERIORES
                </h1>

                <div class="archive-news-list">
                    ${rows}
                </div>

            </section>
        `;


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <section class="page-message">

                <a
                    class="back-link"
                    href="#inicio"
                >
                    ← Volver a Inicio
                </a>

                <h1 class="page-title">
                    NOTICIAS ANTERIORES
                </h1>

                <p>
                    No fue posible cargar las noticias anteriores.
                </p>

            </section>
        `;
    }
}