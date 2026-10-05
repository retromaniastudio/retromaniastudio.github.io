import {
    getChecklistItems
} from "../services/checklist.js";


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const RESULTS_PER_PAGE = 25;


/* =========================================================
   UTILIDADES
   ========================================================= */

function escapeHtml(
    value = ""
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function compareText(
    a,
    b
) {

    return String(a)
        .localeCompare(
            String(b),
            "es",
            {
                sensitivity: "base"
            }
        );
}


function uniqueSorted(
    values
) {

    return [
        ...new Set(
            values
                .map(
                    (value) =>
                        String(value).trim()
                )
                .filter(Boolean)
        )
    ].sort(
        compareText
    );
}


/* =========================================================
   SELECTS
   ========================================================= */

function fillSelect(
    select,
    values,
    defaultLabel,
    currentValue = ""
) {

    const options =
        values
            .map(
                (value) => `
                    <option value="${escapeHtml(value)}">
                        ${escapeHtml(value)}
                    </option>
                `
            )
            .join("");


    select.innerHTML = `
        <option value="">
            ${escapeHtml(defaultLabel)}
        </option>

        ${options}
    `;


    if (
        currentValue
        && values.includes(currentValue)
    ) {

        select.value =
            currentValue;

    } else {

        select.value =
            "";
    }
}


/* =========================================================
   ORDENAR RESULTADOS
   ========================================================= */

function sortResults(
    items
) {

    return [...items]
        .sort(
            (a, b) => {

                return (
                    compareText(
                        a.marca,
                        b.marca
                    )
                    ||
                    compareText(
                        a.coleccion,
                        b.coleccion
                    )
                    ||
                    compareText(
                        a.personaje,
                        b.personaje
                    )
                    ||
                    compareText(
                        a.color,
                        b.color
                    )
                );
            }
        );
}


/* =========================================================
   PAGINACIÓN
   ========================================================= */

/**
 * Genera los números de página que deben mostrarse.
 *
 * Ejemplos:
 *
 * 1 2 3 4 5
 *
 * 1 2 3 ... 20
 *
 * 1 ... 8 9 10 ... 20
 *
 * 1 ... 18 19 20
 *
 * De esta forma podemos tener N páginas sin llenar
 * toda la pantalla de botones.
 */

function getPaginationTokens(
    currentPage,
    totalPages
) {

    if (
        totalPages <= 7
    ) {

        return Array.from(
            {
                length: totalPages
            },
            (_, index) =>
                index + 1
        );
    }


    const pages =
        new Set([
            1,
            totalPages,
            currentPage - 1,
            currentPage,
            currentPage + 1
        ]);


    if (
        currentPage <= 3
    ) {

        pages.add(2);
        pages.add(3);
        pages.add(4);
    }


    if (
        currentPage >= totalPages - 2
    ) {

        pages.add(totalPages - 1);
        pages.add(totalPages - 2);
        pages.add(totalPages - 3);
    }


    const validPages =
        [...pages]
            .filter(
                (page) =>
                    page >= 1
                    && page <= totalPages
            )
            .sort(
                (a, b) =>
                    a - b
            );


    const tokens = [];


    validPages.forEach(
        (page, index) => {

            const previousPage =
                validPages[index - 1];


            if (
                previousPage
                && page - previousPage > 1
            ) {

                tokens.push("...");
            }


            tokens.push(page);

        }
    );


    return tokens;
}


function renderPagination(
    currentPage,
    totalPages
) {

    if (
        totalPages <= 1
    ) {

        return "";
    }


    const tokens =
        getPaginationTokens(
            currentPage,
            totalPages
        );


    const pageButtons =
        tokens
            .map(
                (token) => {

                    if (
                        token === "..."
                    ) {

                        return `
                            <span
                                class="checklist-pagination__ellipsis"
                                aria-hidden="true"
                            >
                                ...
                            </span>
                        `;
                    }


                    const isCurrent =
                        token === currentPage;


                    return `
                        <button
                            type="button"
                            class="
                                checklist-pagination__button
                                ${isCurrent
                            ? "is-current"
                            : ""
                        }
                            "
                            data-checklist-page="${token}"
                            ${isCurrent
                            ? 'aria-current="page"'
                            : ""
                        }
                        >
                            ${token}
                        </button>
                    `;

                }
            )
            .join("");


    return `
        <nav
            class="checklist-pagination"
            aria-label="Paginación del checklist"
        >

            <button
                type="button"
                class="
                    checklist-pagination__button
                    checklist-pagination__button--navigation
                "
                data-checklist-page="${currentPage - 1
        }"
                ${currentPage === 1
            ? "disabled"
            : ""
        }
            >
                ANTERIOR
            </button>


            <div class="checklist-pagination__pages">
                ${pageButtons}
            </div>


            <button
                type="button"
                class="
                    checklist-pagination__button
                    checklist-pagination__button--navigation
                "
                data-checklist-page="${currentPage + 1
        }"
                ${currentPage === totalPages
            ? "disabled"
            : ""
        }
            >
                SIGUIENTE
            </button>

        </nav>
    `;
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function renderResults(
    container,
    items,
    currentPage
) {

    if (
        items.length === 0
    ) {

        container.innerHTML = `
            <div class="checklist-empty">

                No se encontraron piezas con los filtros seleccionados.

            </div>
        `;

        return;
    }


    const totalResults =
        items.length;


    const totalPages =
        Math.ceil(
            totalResults
            / RESULTS_PER_PAGE
        );


    const safeCurrentPage =
        Math.min(
            Math.max(
                currentPage,
                1
            ),
            totalPages
        );


    const startIndex =
        (
            safeCurrentPage - 1
        )
        * RESULTS_PER_PAGE;


    const endIndex =
        Math.min(
            startIndex
            + RESULTS_PER_PAGE,
            totalResults
        );


    const pageItems =
        items.slice(
            startIndex,
            endIndex
        );


    const rows =
        pageItems
            .map(
                (item) => `
                    <tr>

                        <td data-label="Marca">
                            ${escapeHtml(item.marca)}
                        </td>

                        <td data-label="Personaje">
                            ${escapeHtml(item.personaje)}
                        </td>

                        <td data-label="Color">
                            ${escapeHtml(item.color)}
                        </td>

                        <td data-label="Colección">
                            ${escapeHtml(item.coleccion)}
                        </td>

                        <td data-label="Rareza">
                            ${escapeHtml(item.rareza)}
                        </td>

                    </tr>
                `
            )
            .join("");


    container.innerHTML = `
        <div class="checklist-results-header">

            <p class="checklist-results-count">

                Mostrando
                ${startIndex + 1}–${endIndex}
                de
                ${totalResults}
                ${totalResults === 1
            ? "pieza"
            : "piezas"
        }

            </p>

        </div>


        <div class="checklist-table-wrapper">

            <table class="checklist-table">

                <thead>

                    <tr>
                        <th>Marca</th>
                        <th>Personaje</th>
                        <th>Color</th>
                        <th>Colección</th>
                        <th>Rareza</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>


        ${renderPagination(
            safeCurrentPage,
            totalPages
        )}
    `;
}


/* =========================================================
   VISTA
   ========================================================= */

export async function renderChecklist(
    container
) {

    container.innerHTML = `
        <section class="home-loading">
            Cargando checklist...
        </section>
    `;


    try {

        const checklistItems =
            await getChecklistItems();


        /*
         * Estado local de la vista.
         *
         * currentResults contiene todos los resultados
         * encontrados por la búsqueda, no solamente
         * aquellos visibles en la página actual.
         */

        let currentResults = [];

        let currentPage = 1;


        container.innerHTML = `
            <section class="checklist-page">

                <!-- =========================================
                     ENCABEZADO
                     ========================================= -->

                <header class="checklist-page__header">

                    <h1 class="page-title checklist-page__title">
                        CHECKLIST
                    </h1>

                    <p class="checklist-page__intro">
                        Consulta las piezas disponibles en nuestro
                        checklist utilizando uno o varios filtros.
                    </p>

                </header>


                <!-- =========================================
                     FILTROS
                     ========================================= -->

                <section
                    class="checklist-filter-panel"
                    aria-label="Filtros del checklist"
                >

                    <div class="checklist-filter-grid">

                        <div class="checklist-field">

                            <label
                                class="checklist-field__label"
                                for="checklist-brand"
                            >
                                Marca
                            </label>

                            <select
                                id="checklist-brand"
                                class="checklist-field__select"
                            >
                            </select>

                        </div>


                        <div class="checklist-field">

                            <label
                                class="checklist-field__label"
                                for="checklist-collection"
                            >
                                Colección
                            </label>

                            <select
                                id="checklist-collection"
                                class="checklist-field__select"
                            >
                            </select>

                        </div>


                        <div class="checklist-field">

                            <label
                                class="checklist-field__label"
                                for="checklist-color"
                            >
                                Color
                            </label>

                            <select
                                id="checklist-color"
                                class="checklist-field__select"
                            >
                            </select>

                        </div>

                    </div>


                    <div class="checklist-filter-actions">

                        <button
                            type="button"
                            class="
                                checklist-button
                                checklist-button--clear
                            "
                            data-checklist-clear
                        >
                            LIMPIAR
                        </button>


                        <button
                            type="button"
                            class="
                                checklist-button
                                checklist-button--search
                            "
                            data-checklist-search
                        >
                            BUSCAR
                        </button>

                    </div>

                </section>


                <!-- =========================================
                     RESULTADOS
                     ========================================= -->

                <section
                    class="checklist-results"
                    aria-live="polite"
                    data-checklist-results
                >
                </section>

            </section>
        `;


        const brandSelect =
            container.querySelector(
                "#checklist-brand"
            );


        const collectionSelect =
            container.querySelector(
                "#checklist-collection"
            );


        const colorSelect =
            container.querySelector(
                "#checklist-color"
            );


        const searchButton =
            container.querySelector(
                "[data-checklist-search]"
            );


        const clearButton =
            container.querySelector(
                "[data-checklist-clear]"
            );


        const resultsContainer =
            container.querySelector(
                "[data-checklist-results]"
            );


        /* =================================================
           MARCAS
           ================================================= */

        const brands =
            uniqueSorted(
                checklistItems.map(
                    (item) =>
                        item.marca
                )
            );


        fillSelect(
            brandSelect,
            brands,
            "Todas las marcas"
        );


        /* =================================================
           ACTUALIZAR COLECCIONES
           ================================================= */

        function updateCollections() {

            const selectedBrand =
                brandSelect.value;


            const currentCollection =
                collectionSelect.value;


            const source =
                selectedBrand
                    ? checklistItems.filter(
                        (item) =>
                            item.marca
                            === selectedBrand
                    )
                    : checklistItems;


            const collections =
                uniqueSorted(
                    source.map(
                        (item) =>
                            item.coleccion
                    )
                );


            fillSelect(
                collectionSelect,
                collections,
                "Todas las colecciones",
                currentCollection
            );
        }


        /* =================================================
           ACTUALIZAR COLORES
           ================================================= */

        function updateColors() {

            const selectedBrand =
                brandSelect.value;


            const selectedCollection =
                collectionSelect.value;


            const currentColor =
                colorSelect.value;


            let source =
                checklistItems;


            if (selectedBrand) {

                source =
                    source.filter(
                        (item) =>
                            item.marca
                            === selectedBrand
                    );
            }


            if (selectedCollection) {

                source =
                    source.filter(
                        (item) =>
                            item.coleccion
                            === selectedCollection
                    );
            }


            const colors =
                uniqueSorted(
                    source.map(
                        (item) =>
                            item.color
                    )
                );


            fillSelect(
                colorSelect,
                colors,
                "Todos los colores",
                currentColor
            );
        }


        /* =================================================
           MOSTRAR PÁGINA
           ================================================= */

        function showCurrentPage(
            shouldScroll = false
        ) {

            renderResults(
                resultsContainer,
                currentResults,
                currentPage
            );


            if (
                shouldScroll
                && currentResults.length > 0
            ) {

                resultsContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }


        /* =================================================
           ESTADO INICIAL
           ================================================= */

        updateCollections();

        updateColors();


        /* =================================================
           CAMBIO DE MARCA
           ================================================= */

        brandSelect.addEventListener(
            "change",
            () => {

                updateCollections();

                updateColors();

            }
        );


        /* =================================================
           CAMBIO DE COLECCIÓN
           ================================================= */

        collectionSelect.addEventListener(
            "change",
            () => {

                updateColors();

            }
        );


        /* =================================================
           BUSCAR
           ================================================= */

        searchButton.addEventListener(
            "click",
            () => {

                const selectedBrand =
                    brandSelect.value;


                const selectedCollection =
                    collectionSelect.value;


                const selectedColor =
                    colorSelect.value;


                let results =
                    checklistItems;


                if (selectedBrand) {

                    results =
                        results.filter(
                            (item) =>
                                item.marca
                                === selectedBrand
                        );
                }


                if (selectedCollection) {

                    results =
                        results.filter(
                            (item) =>
                                item.coleccion
                                === selectedCollection
                        );
                }


                if (selectedColor) {

                    results =
                        results.filter(
                            (item) =>
                                item.color
                                === selectedColor
                        );
                }


                currentResults =
                    sortResults(
                        results
                    );


                /*
                 * Toda nueva búsqueda comienza
                 * siempre en la página 1.
                 */

                currentPage = 1;


                showCurrentPage();

            }
        );


        /* =================================================
           PAGINACIÓN
           ================================================= */

        resultsContainer.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        "[data-checklist-page]"
                    );


                if (
                    !button
                    || button.disabled
                ) {

                    return;
                }


                const targetPage =
                    Number(
                        button.dataset.checklistPage
                    );


                if (
                    !Number.isInteger(targetPage)
                    || targetPage < 1
                ) {

                    return;
                }


                const totalPages =
                    Math.ceil(
                        currentResults.length
                        / RESULTS_PER_PAGE
                    );


                if (
                    targetPage > totalPages
                ) {

                    return;
                }


                currentPage =
                    targetPage;


                showCurrentPage(
                    true
                );

            }
        );


        /* =================================================
           LIMPIAR
           ================================================= */

        clearButton.addEventListener(
            "click",
            () => {

                brandSelect.value =
                    "";


                updateCollections();


                collectionSelect.value =
                    "";


                updateColors();


                colorSelect.value =
                    "";


                currentResults =
                    [];


                currentPage =
                    1;


                resultsContainer.innerHTML =
                    "";

            }
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <section class="page-message">

                <h1 class="page-title">
                    CHECKLIST
                </h1>

                <p>
                    No fue posible cargar el checklist.
                </p>

            </section>
        `;
    }
}