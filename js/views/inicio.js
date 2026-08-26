import {
    getNoticiasRecientes,
    getNoticiasAnteriores
} from "../services/noticias.js";

import {
    getSitioConfig
} from "../services/sitio.js";

import {
    escapeHtml,
    formatNewsDate,
    createExcerpt,
    resolveNewsImage
} from "../utils/noticias.js";


function sortByDateDescending(
    a,
    b
) {

    return (
        new Date(b.noticia.fecha)
        - new Date(a.noticia.fecha)
    );
}


function renderPrincipal(
    item
) {

    if (!item) {

        return "";
    }


    const {
        noticia,
        index
    } = item;


    return `
        <article class="news-featured">

            <img
                class="news-featured__image"
                src="${resolveNewsImage(noticia.imagen)}"
                alt=""
                data-news-image
            >

            <div class="news-featured__body">

                <p class="news-date">
                    ${formatNewsDate(noticia.fecha)}
                </p>

                <h3 class="news-featured__title">
                    ${escapeHtml(noticia.titulo)}
                </h3>

                <p class="news-featured__excerpt">
                    ${escapeHtml(
        createExcerpt(
            noticia.contenido,
            300
        )
    )}
                </p>

                <a
                    class="news-more-link"
                    href="#noticia/recientes/${index}"
                >
                    Más...
                </a>

            </div>

        </article>
    `;
}


function renderSecondary(
    item
) {

    const {
        noticia,
        index
    } = item;


    return `
        <article class="news-secondary">

            <img
                class="news-secondary__image"
                src="${resolveNewsImage(noticia.imagen)}"
                alt=""
                data-news-image
            >

            <div class="news-secondary__body">

                <p class="news-date">
                    ${formatNewsDate(noticia.fecha)}
                </p>

                <h3 class="news-secondary__title">
                    ${escapeHtml(noticia.titulo)}
                </h3>

                <p class="news-secondary__excerpt">
                    ${escapeHtml(
        createExcerpt(
            noticia.contenido,
            180
        )
    )}
                </p>

                <a
                    class="news-more-link"
                    href="#noticia/recientes/${index}"
                >
                    Más...
                </a>

            </div>

        </article>
    `;
}


function renderSocials(
    sitioConfig
) {

    const socials =
        Array.isArray(sitioConfig.redes)
            ? sitioConfig.redes
            : [];


    if (
        socials.length === 0
    ) {

        return `
            <p class="welcome-copy">
                Próximamente agregaremos nuestras redes sociales.
            </p>
        `;
    }


    return socials
        .map(
            (social) => {

                const name =
                    String(
                        social.nombre ?? ""
                    ).trim();


                const icon =
                    String(
                        social.icono ?? ""
                    ).trim();


                const url =
                    String(
                        social.url ?? ""
                    ).trim();


                /*
                 * Si el registro no tiene icono,
                 * no intentamos mostrarlo.
                 */

                if (!icon) {

                    return "";
                }


                const content = `
                    <img
                        class="social-link__icon"
                        src="${escapeHtml(icon)}"
                        alt=""
                    >

                    <span class="visually-hidden">
                        ${escapeHtml(name)}
                    </span>
                `;


                /*
                 * Si todavía no existe URL,
                 * mostramos el icono sin enlace.
                 */

                if (!url) {

                    return `
                        <div
                            class="social-link social-link--disabled"
                            title="${escapeHtml(name)}"
                            aria-label="${escapeHtml(name)}"
                        >
                            ${content}
                        </div>
                    `;
                }


                return `
                    <a
                        class="social-link"
                        href="${escapeHtml(url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="${escapeHtml(name)}"
                        aria-label="${escapeHtml(name)}"
                    >
                        ${content}
                    </a>
                `;

            }
        )
        .join("");
}


function renderVideo(
    sitioConfig
) {

    const playlistUrl =
        String(
            sitioConfig.youtube_playlist ?? ""
        ).trim();


    if (!playlistUrl) {

        return `
            <div class="video-placeholder">

                <p>
                    La playlist de YouTube se agregará aquí.
                </p>

            </div>
        `;
    }


    return `
        <div class="video-frame">

            <iframe
                src="${escapeHtml(playlistUrl)}"
                title="Últimos videos de Retromania Studio"
                loading="lazy"
                allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    web-share
                "
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
            >
            </iframe>

        </div>
    `;
}


function installImageFallbacks(
    container
) {

    const images =
        container.querySelectorAll(
            "[data-news-image]"
        );


    images.forEach(
        (image) => {

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

        }
    );
}


export async function renderInicio(
    container
) {

    container.innerHTML = `
        <section class="home-loading">
            Cargando inicio...
        </section>
    `;


    try {

        /*
         * Inicio obtiene ahora tres fuentes de información:
         *
         * 1. Noticias recientes.
         * 2. Noticias anteriores.
         * 3. Configuración general del sitio.
         */

        const [
            noticiasRecientes,
            noticiasAnteriores,
            sitioConfig
        ] = await Promise.all([
            getNoticiasRecientes(),
            getNoticiasAnteriores(),
            getSitioConfig()
        ]);


        const indexedNoticias =
            noticiasRecientes.map(
                (noticia, index) => ({
                    noticia,
                    index
                })
            );


        /*
         * Puede existir 0 o 1 noticia principal.
         *
         * Si por error llegan varias con principal=true,
         * la web utiliza únicamente la primera como
         * principal.
         */

        const principal =
            indexedNoticias.find(
                (item) =>
                    item.noticia.principal === true
            );


        const secondary =
            indexedNoticias
                .filter(
                    (item) =>
                        item !== principal
                )
                .sort(
                    sortByDateDescending
                );


        const hasPreviousNews =
            noticiasAnteriores.length > 0;


        let newsContent = "";


        if (
            noticiasRecientes.length === 0
        ) {

            newsContent = `
                <div class="news-empty">
                    Aún no hay noticias publicadas.
                </div>
            `;

        } else {

            newsContent = `
                ${renderPrincipal(principal)}

                <div class="news-secondary-list">
                    ${secondary
                    .map(renderSecondary)
                    .join("")
                }
                </div>
            `;
        }


        container.innerHTML = `
            <div class="home-layout">

                <!-- =========================================
                     COLUMNA PRINCIPAL
                     ========================================= -->

                <div class="home-column home-column--main">

                    <!-- =====================================
                         BIENVENIDA
                         ===================================== -->

                    <section class="home-section home-welcome">

                        <h1 class="home-section__title">
                            BIENVENIDOS
                        </h1>

                        <div class="welcome-copy">

                            <p>
                                ¡Bienvenidos a RetromanÍa Studio! 
                                El espacio definitivo para los amantes de la cultura pop, el coleccionismo y la nostalgia de los años 
                                80s, 90s y principios de los 00s. 
                                Si creciste abriendo cápsulas de juguetes, coleccionando figuras de acción, leyendo cómics y mangas, 
                                o pasando horas frente al televisor viendo tus películas y caricaturas favoritas en VHS, este es tu lugar.
                            </p>

                            <p>
                                ¿Qué vas a encontrar aquí? 
                                Coleccionismo Retro: Un viaje al pasado a través de figuras, 
                                promocionales y piezas icónicas. Cómics y Mangas: Reseñas, análisis y 
                                un repaso por las historias que marcaron nuestra infancia y juventud. 
                                Cine y TV: Joyas de los 80s, 90s y más allá que se convirtieron en clásicos de culto. 
                                Prepara tu máquina del tiempo, suscríbete y acompáñame a revivir las mejores épocas. 
                                ¡La RetromanÍa no es una moda, es un estilo de vida!
                            </p>

                        </div>

                    </section>


                    <!-- =====================================
                         ÚLTIMAS NOTICIAS
                         ===================================== -->

                    <section class="home-section home-news">

                        <h2 class="home-section__title">
                            ÚLTIMAS NOTICIAS
                        </h2>

                        ${newsContent}

                        ${hasPreviousNews
                ? `
                                    <div class="news-archive-action">

                                        <a
                                            href="#anteriores"
                                            class="news-archive-link"
                                        >
                                            ANTERIORES
                                        </a>

                                    </div>
                                `
                : ""
            }

                    </section>

                </div>


                <!-- =========================================
                     COLUMNA SECUNDARIA
                     ========================================= -->

                <aside class="home-column home-column--side">

                    <!-- =====================================
                         ÚLTIMOS VIDEOS
                         ===================================== -->

                    <section class="home-section home-videos">

                        <h2 class="home-section__title">
                            ÚLTIMOS VIDEOS
                        </h2>

                        ${renderVideo(sitioConfig)}

                    </section>


                    <!-- =====================================
                         REDES
                         ===================================== -->

                    <section class="home-section home-socials">

                        <h2 class="home-section__title">
                            NUESTRAS REDES
                        </h2>

                        <div class="social-links">
                            ${renderSocials(sitioConfig)}
                        </div>

                    </section>

                </aside>

            </div>
        `;


        installImageFallbacks(
            container
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <section class="page-message">

                <h1 class="page-title">
                    INICIO
                </h1>

                <p>
                    No fue posible cargar la información
                    de la página de inicio.
                </p>

            </section>
        `;
    }
}