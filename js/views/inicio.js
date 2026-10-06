import { getNoticiasRecientes, getNoticiasAnteriores } from "../services/noticias.js";
import { getSitioConfig } from "../services/sitio.js";
import { getColeccionables } from "../services/coleccionables.js";
import { getCalendario } from "../services/calendario.js";
import { escapeHtml, formatNewsDate, createExcerpt, resolveNewsImage } from "../utils/noticias.js";

function renderLegacyHero(config) {
    const hero = config.hero ?? {};
    if (hero.activo === false) return "";

    const image = String(hero.imagen ?? "").trim();
    const style = image ? ` style="--hero-image: url('${escapeHtml(image)}')"` : "";

    return `
        <section class="home-hero ${image ? "home-hero--image" : ""}"${style}>
            <div class="home-hero__overlay"></div>
            <div class="home-hero__content">
                <p class="home-hero__eyebrow">${escapeHtml(hero.eyebrow ?? "RETROMANÍA STUDIO")}</p>
                <h1 class="home-hero__title">${escapeHtml(hero.titulo ?? "RETROMANÍA STUDIO")}</h1>
                <p class="home-hero__description">${escapeHtml(hero.descripcion ?? "")}</p>
                <div class="home-hero__actions">
                    ${hero.boton_texto && hero.boton_destino ? `<a class="button button--primary" href="${escapeHtml(hero.boton_destino)}">${escapeHtml(hero.boton_texto)}</a>` : ""}
                    ${hero.secundario_texto && hero.secundario_destino ? `<a class="button button--ghost" href="${escapeHtml(hero.secundario_destino)}">${escapeHtml(hero.secundario_texto)}</a>` : ""}
                </div>
            </div>
        </section>
    `;
}

function renderNewsHero(indexedNews, sitio) {
    const sourceHasHero = indexedNews.some(({ noticia }) =>
        Object.prototype.hasOwnProperty.call(noticia, "hero")
    );
    let selected = indexedNews.find(({ noticia }) => noticia.hero === true);

    // Compatibilidad con JSON anteriores: `principal` significaba Hero.
    if (!sourceHasHero) {
        selected = indexedNews.find(({ noticia }) => noticia.principal === true);
    }

    // Cuando Puka publica `hero`, ese campo es la fuente de verdad.
    // Si no hay ninguna noticia marcada, el Hero se oculta.
    if (sourceHasHero && !selected) return "";
    if (!selected) return renderLegacyHero(sitio);

    const { noticia, index } = selected;
    const image = String(noticia.imagen ?? "").trim();
    const resolvedImage = image ? resolveNewsImage(image) : "";
    const buttonText = String(noticia.boton_texto ?? "").trim() || "LEER NOTICIA";
    const buttonLink = String(noticia.boton_enlace ?? "").trim() || `#noticia/recientes/${index}`;
    const type = String(noticia.tipo ?? "").trim();

    return `
        <section class="home-hero ${resolvedImage ? "home-hero--image" : ""}">
            ${resolvedImage ? `<img class="home-hero__background" src="${escapeHtml(resolvedImage)}" alt="">` : ""}
            <div class="home-hero__overlay"></div>
            <div class="home-hero__content">
                <p class="home-hero__eyebrow">${escapeHtml(type ? `${type} · RETROMANÍA STUDIO` : "RETROMANÍA STUDIO PRESENTA")}</p>
                <h1 class="home-hero__title">${escapeHtml(noticia.titulo ?? "")}</h1>
                <p class="home-hero__description">${escapeHtml(createExcerpt(noticia.contenido, 230))}</p>
                <div class="home-hero__actions">
                    <a class="button button--primary" href="${escapeHtml(buttonLink)}">${escapeHtml(buttonText)}</a>
                </div>
            </div>
        </section>
    `;
}

function renderCollectibleCard(item) {
    const image = String(item.imagen ?? "").trim();
    return `
        <a class="home-collectible-card" href="#coleccionables/${escapeHtml(item.id ?? "")}">
            <div class="home-collectible-card__media ${image ? "" : "home-collectible-card__media--placeholder"}">
                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.nombre ?? "")}">` : `<img src="./img/general/logo.png" alt="">`}
            </div>
            <div class="home-collectible-card__body">
                <span>${escapeHtml(item.estado ?? "")}</span>
                <h3>${escapeHtml(item.nombre ?? "")}</h3>
                <p>${escapeHtml(item.subtitulo ?? "")}</p>
            </div>
        </a>
    `;
}

function formatCalendarDate(item) {
    if (!item.fecha_inicio) return "PRÓXIMAMENTE";
    const start = new Date(`${item.fecha_inicio}T00:00:00`);
    const end = item.fecha_fin ? new Date(`${item.fecha_fin}T00:00:00`) : null;
    if (Number.isNaN(start.getTime())) return "PRÓXIMAMENTE";
    const day = String(start.getDate()).padStart(2, "0");
    const month = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(start).toUpperCase().replace(".", "");
    if (end && !Number.isNaN(end.getTime()) && end.getTime() !== start.getTime()) {
        return `${day}–${String(end.getDate()).padStart(2, "0")} ${month}`;
    }
    return `${day} ${month}`;
}

function renderUpcomingCard(item) {
    const image = String(item.imagen ?? "").trim();
    const type = String(item.tipo ?? "").trim();
    const link = String(item.enlace ?? "").trim();
    const inner = `
        <div class="home-calendar-card__date">${escapeHtml(formatCalendarDate(item))}</div>
        <div class="home-calendar-card__body">
            ${image ? `<img class="home-calendar-card__image" src="${escapeHtml(image)}" alt="">` : ""}
            <div class="agenda-meta">
                ${type ? `<span class="agenda-type">${escapeHtml(type)}</span>` : ""}
                ${item.estado ? `<span class="status-pill">${escapeHtml(item.estado)}</span>` : ""}
            </div>
            <h3>${escapeHtml(item.titulo ?? "")}</h3>
            <p>${escapeHtml(item.descripcion ?? "")}</p>
        </div>
    `;
    return link
        ? `<a class="home-calendar-card home-calendar-card--link" href="${escapeHtml(link)}">${inner}</a>`
        : `<article class="home-calendar-card">${inner}</article>`;
}

function renderVideo(config) {
    const url = String(config.youtube_playlist ?? "").trim();
    if (!url) return `<div class="video-placeholder"><p>Próximamente agregaremos nuestro contenido de YouTube.</p></div>`;
    return `<div class="video-frame"><iframe src="${escapeHtml(url)}" title="Retromanía Studio en YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
}

function renderNews(items) {
    if (!items.length) return `<div class="news-empty">Aún no hay noticias publicadas.</div>`;
    return items.slice(0, 3).map(({ noticia, index }) => `
        <article class="news-card">
            <img class="news-card__image" src="${resolveNewsImage(noticia.imagen)}" alt="" data-news-image>
            <div class="news-card__body">
                <p class="news-date">${formatNewsDate(noticia.fecha)}</p>
                <h3>${escapeHtml(noticia.titulo)}</h3>
                <p>${escapeHtml(createExcerpt(noticia.contenido, 180))}</p>
                <a class="news-more-link" href="#noticia/recientes/${index}">LEER MÁS</a>
            </div>
        </article>
    `).join("");
}

function installImageFallbacks(container) {
    container.querySelectorAll("[data-news-image]").forEach(image => {
        image.addEventListener("error", () => {
            if (image.dataset.fallbackApplied) return;
            image.dataset.fallbackApplied = "true";
            image.src = "./img/general/logo.png";
        });
    });
}

export async function renderInicio(container) {
    container.innerHTML = `<section class="home-loading">Cargando inicio...</section>`;

    try {
        const [noticias, anteriores, sitio, coleccionables, calendario] = await Promise.all([
            getNoticiasRecientes(),
            getNoticiasAnteriores(),
            getSitioConfig(),
            getColeccionables(),
            getCalendario()
        ]);

        const indexedNews = noticias.map((noticia, index) => ({ noticia, index }))
            .sort((a, b) => {
                const featuredA = a.noticia.destacada === true ? 1 : 0;
                const featuredB = b.noticia.destacada === true ? 1 : 0;
                if (featuredA !== featuredB) return featuredB - featuredA;
                return new Date(b.noticia.fecha) - new Date(a.noticia.fecha);
            });
        const featuredCollectibles = coleccionables.filter(item => item.destacado !== false).slice(0, 3);
        const upcoming = calendario.slice(0, 3);

        container.innerHTML = `
            <div class="home-page">
                ${renderNewsHero(indexedNews, sitio)}


                <section class="home-block">
                    <div class="section-heading section-heading--split">
                        <div>
                            <p class="section-kicker">NUESTRAS WAVES</p>
                            <h2>COLECCIONABLES DESTACADOS</h2>
                        </div>
                        <a href="#coleccionables" class="text-action">VER TODOS →</a>
                    </div>
                    <div class="home-collectible-grid">${featuredCollectibles.map(renderCollectibleCard).join("")}</div>
                </section>

                <section class="home-block home-upcoming">
                    <div class="section-heading section-heading--split">
                        <div>
                            <p class="section-kicker">AGENDA</p>
                            <h2>PRÓXIMAMENTE</h2>
                        </div>
                    </div>
                    <div class="home-calendar-grid">
                        ${upcoming.map(renderUpcomingCard).join("") || `<div class="news-empty">Aún no hay fechas publicadas.</div>`}
                    </div>
                </section>

                <section class="home-block">
                    <div class="section-heading section-heading--split">
                        <div>
                            <p class="section-kicker">ACTUALIDAD</p>
                            <h2>NOVEDADES</h2>
                        </div>
                        ${anteriores.length ? `<a href="#anteriores" class="text-action">NOTICIAS ANTERIORES →</a>` : ""}
                    </div>
                    <div class="news-grid">${renderNews(indexedNews)}</div>
                </section>

                <section class="home-block home-youtube">
                    <div class="section-heading section-heading--center">
                        <p class="section-kicker">VIDEO</p>
                        <h2>RETROMANÍA EN YOUTUBE</h2>
                        <p class="section-intro">Contenido, recuerdos y coleccionismo retro desde nuestro canal.</p>
                    </div>
                    ${renderVideo(sitio)}
                </section>
            </div>
        `;

        installImageFallbacks(container);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<section class="page-message"><h1 class="page-title">INICIO</h1><p>No fue posible cargar la información de la página de inicio.</p></section>`;
    }
}
