const PEDIDOS_URL =
    "./data/pedidos.json";


/**
 * Carga el archivo público de pedidos.
 */
async function fetchPedidos() {

    const response =
        await fetch(
            PEDIDOS_URL,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `No fue posible cargar ${PEDIDOS_URL}.`
        );
    }


    const data =
        await response.json();


    if (
        !data
        || typeof data !== "object"
        || Array.isArray(data)
    ) {

        throw new Error(
            `${PEDIDOS_URL} no contiene una estructura válida.`
        );
    }


    return data;
}


/**
 * Convierte la estructura:
 *
 * {
 *     "RETROMANIA STUDIO": [
 *         {...},
 *         {...}
 *     ]
 * }
 *
 * en una lista plana de pedidos.
 *
 * No dependemos directamente del nombre
 * "RETROMANIA STUDIO", por lo que en el futuro
 * podrían existir otros grupos dentro del JSON.
 */
function flattenPedidos(
    data
) {

    const pedidos = [];


    Object.values(data)
        .forEach(
            (grupo) => {

                if (!Array.isArray(grupo)) {

                    return;
                }


                grupo.forEach(
                    (registro) => {

                        const pedido =
                            String(
                                registro.pedido ?? ""
                            ).trim();


                        const estatus =
                            String(
                                registro.estatus ?? ""
                            ).trim();


                        const comentario =
                            String(
                                registro.comentario ?? ""
                            ).trim();


                        if (!pedido) {

                            return;
                        }


                        pedidos.push({
                            pedido,
                            estatus,
                            comentario
                        });

                    }
                );

            }
        );


    return pedidos;
}


/**
 * Devuelve todos los pedidos publicados.
 */
export async function getPedidos() {

    const data =
        await fetchPedidos();


    return flattenPedidos(
        data
    );
}