import { getColeccionables } from "../services/coleccionables.js";
import { escapeHtml } from "../utils/noticias.js";

function formatPrice(value, currency = "MXN") {
    const amount = Number(value ?? 0);
    try {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: String(currency || "MXN").toUpperCase(),
            maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        }).format(amount);
    } catch (_) {
        return `$${amount.toFixed(Number.isInteger(amount) ? 0 : 2)}`;
    }
}

function renderVariantRows(variants) {
    const available = Array.isArray(variants)
        ? variants.filter(item => String(item.estatus ?? "DISPONIBLE").toUpperCase() === "DISPONIBLE")
        : [];
    if (!available.length) return "";

    return `
        <div class="variant-list">
            ${available.map(variant => `
                <div class="variant-row">
                    <div class="variant-row__name">
                        <strong>${escapeHtml(variant.nombre ?? "")}</strong>
                        ${variant.descripcion ? `<small>${escapeHtml(variant.descripcion)}</small>` : ""}
                    </div>
                    <span class="variant-row__status">Disponible</span>
                    <strong class="variant-row__price">${escapeHtml(formatPrice(variant.precio, variant.moneda))}</strong>
                </div>
            `).join("")}
        </div>
    `;
}

function renderSetAvailability(item) {
    if (item.venta_set !== true) return "";
    const rows = renderVariantRows(item.variantes_set);
    if (!rows) return "";
    return `
        <section class="collection-pricing" aria-label="Versiones disponibles del set">
            <p class="collection-pricing__label">SET · VERSIONES DISPONIBLES</p>
            ${rows}
        </section>
    `;
}

function renderProducts(piece) {
    const products = Array.isArray(piece.productos) ? piece.productos : [];
    const visible = products.filter(product => {
        const variants = Array.isArray(product.variantes) ? product.variantes : [];
        return variants.some(v => String(v.estatus ?? "DISPONIBLE").toUpperCase() === "DISPONIBLE");
    });
    if (!visible.length) return "";

    return `
        <div class="piece-products">
            ${visible.map(product => `
                <section class="piece-product">
                    <div class="piece-product__heading">
                        <strong>${escapeHtml(product.nombre ?? "")}</strong>
                        ${product.tipo ? `<span>${escapeHtml(product.tipo)}</span>` : ""}
                    </div>
                    ${product.descripcion ? `<p>${escapeHtml(product.descripcion)}</p>` : ""}
                    ${renderVariantRows(product.variantes)}
                </section>
            `).join("")}
        </div>
    `;
}

function renderCard(item) {
    const image = String(item.imagen ?? "").trim();
    const slug = String(item.id ?? "").trim();
    return `
        <a class="collectible-card collectible-card--link" href="#coleccionables/${escapeHtml(slug)}">
            <div class="collectible-card__media ${image ? "" : "collectible-card__media--placeholder"}">
                ${image
                    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.nombre ?? "Coleccionable")}">`
                    : `<img src="./img/general/logo.png" alt="" class="collectible-card__placeholder-logo">`
                }
            </div>
            <div class="collectible-card__body">
                <p class="collectible-card__status">${escapeHtml(item.estado ?? "")}</p>
                <h2 class="collectible-card__title">${escapeHtml(item.nombre ?? "")}</h2>
                <p class="collectible-card__subtitle">${escapeHtml(item.subtitulo ?? "")}</p>
                <span class="collectible-card__action">VER COLECCIÓN →</span>
            </div>
        </a>
    `;
}

function renderPiece(piece, showIndividualPrices = false) {
    const image = String(piece.imagen ?? "").trim();
    return `
        <article class="piece-card">
            <div class="piece-card__media ${image ? "" : "piece-card__media--placeholder"}">
                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(piece.nombre ?? "")}">` : `<img src="./img/general/logo.png" alt="">`}
            </div>
            <div class="piece-card__body">
                <h3>${escapeHtml(piece.nombre ?? "")}</h3>
                ${piece.descripcion ? `<p>${escapeHtml(piece.descripcion)}</p>` : ""}
                ${piece.estado ? `<span class="piece-card__status">${escapeHtml(piece.estado)}</span>` : ""}
                ${showIndividualPrices ? renderProducts(piece) : ""}
            </div>
        </article>
    `;
}

export async function renderColeccionables(container, slug = "") {
    container.innerHTML = `<section class="home-loading">Cargando coleccionables...</section>`;

    try {
        const allItems = await getColeccionables();
        const items = allItems.filter(item => item.publicado !== false);

        if (slug) {
            const item = items.find(entry => String(entry.id ?? "").toLowerCase() === slug.toLowerCase());
            if (!item) {
                container.innerHTML = `<section class="page-message"><a class="back-link" href="#coleccionables">← Volver a coleccionables</a><h1 class="page-title">COLECCIÓN NO ENCONTRADA</h1></section>`;
                return;
            }

            const image = String(item.imagen ?? "").trim();
            const pieces = Array.isArray(item.piezas) ? item.piezas.filter(piece => piece.publicado !== false) : [];
            const showIndividualPrices = item.venta_individual === true;

            container.innerHTML = `
                <section class="collection-detail">
                    <a class="back-link" href="#coleccionables">← COLECCIONABLES</a>
                    <div class="collection-detail__hero">
                        <div class="collection-detail__media ${image ? "" : "collection-detail__media--placeholder"}">
                            ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.nombre ?? "")}">` : `<img src="./img/general/logo.png" alt="">`}
                        </div>
                        <div class="collection-detail__info">
                            <p class="section-kicker">COLECCIÓN</p>
                            <h1>${escapeHtml(item.nombre ?? "")}</h1>
                            <p class="collection-detail__status">${escapeHtml(item.estado ?? "")}</p>
                            <p>${escapeHtml(item.descripcion ?? item.subtitulo ?? "")}</p>
                            ${renderSetAvailability(item)}
                        </div>
                    </div>

                    <div class="section-heading section-heading--split collection-detail__pieces-heading">
                        <div>
                            <p class="section-kicker">PIEZAS</p>
                            <h2>LA COLECCIÓN</h2>
                        </div>
                    </div>

                    ${pieces.length
                        ? `<div class="piece-grid">${pieces.map(piece => renderPiece(piece, showIndividualPrices)).join("")}</div>`
                        : `<div class="collection-empty"><strong>Contenido en preparación</strong><p>Las piezas de esta colección se publicarán aquí conforme estén listas para mostrarse.</p></div>`
                    }
                </section>
            `;
            return;
        }

        container.innerHTML = `
            <section class="catalog-page">
                <header class="section-heading section-heading--center">
                    <p class="section-kicker">RETROMANÍA STUDIO</p>
                    <h1 class="page-title">COLECCIONABLES</h1>
                    <p class="section-intro">Explora las waves y colecciones publicadas por Retromanía Studio.</p>
                </header>
                <div class="collectible-grid">
                    ${items.map(renderCard).join("")}
                </div>
            </section>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = `<section class="page-message"><h1 class="page-title">COLECCIONABLES</h1><p>No fue posible cargar los coleccionables.</p></section>`;
    }
}
