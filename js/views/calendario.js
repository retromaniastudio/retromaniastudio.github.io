import { getCalendario } from "../services/calendario.js";
import { escapeHtml } from "../utils/noticias.js";

function formatRange(item) {
    const start = item.fecha_inicio ? new Date(`${item.fecha_inicio}T00:00:00`) : null;
    const end = item.fecha_fin ? new Date(`${item.fecha_fin}T00:00:00`) : null;
    if (!start || Number.isNaN(start.getTime())) return "PRÓXIMAMENTE";

    const day = new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(start);
    const month = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(start).toUpperCase().replace(".", "");
    const year = start.getFullYear();

    if (end && !Number.isNaN(end.getTime()) && end.getTime() !== start.getTime()) {
        const endDay = new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(end);
        const endMonth = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(end).toUpperCase().replace(".", "");
        const endYear = end.getFullYear();
        if (endYear !== year) return `${day} ${month} ${year} – ${endDay} ${endMonth} ${endYear}`;
        if (endMonth !== month) return `${day} ${month} – ${endDay} ${endMonth} ${year}`;
        return `${day}–${endDay} ${month} ${year}`;
    }

    return `${day} ${month} ${year}`;
}

function renderEvent(item) {
    const image = String(item.imagen ?? "").trim();
    const type = String(item.tipo ?? "").trim();
    const link = String(item.enlace ?? "").trim();

    const content = `
        ${image ? `<div class="calendar-card__media"><img src="${escapeHtml(image)}" alt=""></div>` : ""}
        <div class="calendar-card__date">${escapeHtml(formatRange(item))}</div>
        <div class="calendar-card__content">
            <div class="calendar-card__topline">
                <h2>${escapeHtml(item.titulo ?? "")}</h2>
                <div class="agenda-meta">
                    ${type ? `<span class="agenda-type">${escapeHtml(type)}</span>` : ""}
                    ${item.estado ? `<span class="status-pill">${escapeHtml(item.estado)}</span>` : ""}
                </div>
            </div>
            <p>${escapeHtml(item.descripcion ?? "")}</p>
            ${link ? `<span class="calendar-card__action">VER MÁS →</span>` : ""}
        </div>
    `;

    const classes = `calendar-card${image ? " calendar-card--with-image" : ""}${link ? " calendar-card--link" : ""}`;
    return link
        ? `<a class="${classes}" href="${escapeHtml(link)}">${content}</a>`
        : `<article class="${classes}">${content}</article>`;
}

export async function renderCalendario(container) {
    container.innerHTML = `<section class="home-loading">Cargando agenda...</section>`;
    try {
        const events = await getCalendario();
        container.innerHTML = `
            <section class="calendar-page">
                <header class="section-heading section-heading--center">
                    <p class="section-kicker">LO QUE VIENE</p>
                    <h1 class="page-title">AGENDA</h1>
                    <p class="section-intro">Fechas de preventas, lanzamientos, eventos y actividades de Retromanía Studio.</p>
                </header>
                <div class="calendar-list">
                    ${events.map(renderEvent).join("") || `<div class="news-empty">Aún no hay eventos publicados.</div>`}
                </div>
            </section>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = `<section class="page-message"><h1 class="page-title">AGENDA</h1><p>No fue posible cargar la agenda.</p></section>`;
    }
}
