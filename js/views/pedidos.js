import {
    getPedidos
} from "../services/pedidos.js";


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


function normalizePedidoId(
    value
) {

    return String(value ?? "")
        .trim()
        .toUpperCase();
}


/* =========================================================
   RESULTADO
   ========================================================= */

function renderPedidoResult(
    container,
    pedido
) {

    container.innerHTML = `
        <div class="order-result-card">

            <div class="order-result-field">

                <span class="order-result-field__label">
                    Pedido
                </span>

                <span class="order-result-field__value">
                    ${escapeHtml(pedido.pedido)}
                </span>

            </div>


            <div class="order-result-field">

                <span class="order-result-field__label">
                    Estatus
                </span>

                <span class="order-result-field__value order-result-status">
                    ${escapeHtml(pedido.estatus)}
                </span>

            </div>


            <div class="order-result-field order-result-field--comment">

                <span class="order-result-field__label">
                    Comentario
                </span>

                <span class="order-result-field__value">
                    ${pedido.comentario
            ? escapeHtml(pedido.comentario)
            : "Sin comentarios adicionales."
        }
                </span>

            </div>

        </div>
    `;
}


function renderNotFound(
    container
) {

    container.innerHTML = `
        <div class="order-not-found">

            <strong>
                PEDIDO NO ENCONTRADO
            </strong>

            <p>
                Verifica el ID de tu pedido e inténtalo nuevamente.
            </p>

        </div>
    `;
}


/* =========================================================
   VISTA
   ========================================================= */

export async function renderPedidos(
    container
) {

    container.innerHTML = `
        <section class="home-loading">
            Cargando pedidos...
        </section>
    `;


    try {

        const pedidos =
            await getPedidos();


        container.innerHTML = `
            <section class="orders-page">

                <!-- =========================================
                     ENCABEZADO
                     ========================================= -->

                <header class="orders-page__header">

                    <h1 class="page-title orders-page__title">
                        PEDIDOS
                    </h1>

                    <p class="orders-page__intro">
                        Ingresa el ID que recibiste al confirmar
                        tu pedido para consultar su estatus actual.
                    </p>

                </header>


                <!-- =========================================
                     BUSCADOR
                     ========================================= -->

                <section
                    class="order-search-panel"
                    aria-label="Consultar pedido"
                >

                    <div class="order-search-form">

                        <div class="order-search-field">

                            <label
                                class="order-search-field__label"
                                for="order-search-input"
                            >
                                Pedido
                            </label>

                            <input
                                id="order-search-input"
                                class="order-search-field__input"
                                type="text"
                                autocomplete="off"
                                spellcheck="false"
                                placeholder="Ej. RW1-001"
                            >

                        </div>


                        <div class="order-search-actions">

                            <button
                                type="button"
                                class="
                                    order-button
                                    order-button--clear
                                "
                                data-order-clear
                            >
                                LIMPIAR
                            </button>


                            <button
                                type="button"
                                class="
                                    order-button
                                    order-button--search
                                "
                                data-order-search
                            >
                                BUSCAR
                            </button>

                        </div>

                    </div>

                </section>


                <!-- =========================================
                     RESULTADO
                     ========================================= -->

                <section
                    class="order-results"
                    aria-live="polite"
                    data-order-results
                >
                </section>

            </section>
        `;


        const input =
            container.querySelector(
                "#order-search-input"
            );


        const searchButton =
            container.querySelector(
                "[data-order-search]"
            );


        const clearButton =
            container.querySelector(
                "[data-order-clear]"
            );


        const resultsContainer =
            container.querySelector(
                "[data-order-results]"
            );


        /* =================================================
           BUSCAR
           ================================================= */

        function searchPedido() {

            const searchValue =
                normalizePedidoId(
                    input.value
                );


            if (!searchValue) {

                resultsContainer.innerHTML =
                    "";

                input.focus();

                return;
            }


            const foundPedido =
                pedidos.find(
                    (pedido) =>
                        normalizePedidoId(
                            pedido.pedido
                        )
                        === searchValue
                );


            if (!foundPedido) {

                renderNotFound(
                    resultsContainer
                );

                return;
            }


            renderPedidoResult(
                resultsContainer,
                foundPedido
            );

        }


        searchButton.addEventListener(
            "click",
            searchPedido
        );


        /* =================================================
           ENTER
           ================================================= */

        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !== "Enter"
                ) {

                    return;
                }


                event.preventDefault();

                searchPedido();

            }
        );


        /* =================================================
           LIMPIAR
           ================================================= */

        clearButton.addEventListener(
            "click",
            () => {

                input.value =
                    "";


                resultsContainer.innerHTML =
                    "";


                input.focus();

            }
        );


        /*
         * Dejamos el cursor preparado para
         * comenzar una consulta inmediatamente.
         */

        input.focus();


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <section class="page-message">

                <h1 class="page-title">
                    PEDIDOS
                </h1>

                <p>
                    No fue posible cargar la información
                    de pedidos.
                </p>

            </section>
        `;
    }
}