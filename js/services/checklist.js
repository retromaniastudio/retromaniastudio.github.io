const CHECKLIST_URL =
    "./data/checklist.json";


/**
 * Carga el checklist desde el archivo JSON.
 */
async function fetchChecklist() {

    const response =
        await fetch(
            CHECKLIST_URL,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `No fue posible cargar ${CHECKLIST_URL}.`
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
            `${CHECKLIST_URL} no contiene una estructura válida.`
        );
    }


    return data;
}


/**
 * Convierte la estructura jerárquica:
 *
 * Marca
 *   -> Colección
 *      -> Color
 *         -> Piezas
 *
 * en una lista plana:
 *
 * [
 *   {
 *      marca,
 *      coleccion,
 *      color,
 *      personaje,
 *      rareza
 *   }
 * ]
 *
 * Esto facilita las búsquedas y filtros
 * dentro de la vista.
 */
function flattenChecklist(
    data
) {

    const items = [];


    Object.entries(data)
        .forEach(
            ([
                marca,
                registros
            ]) => {

                if (
                    !Array.isArray(registros)
                ) {

                    return;
                }


                registros.forEach(
                    (registro) => {

                        const coleccion =
                            String(
                                registro.coleccion ?? ""
                            ).trim();


                        const color =
                            String(
                                registro.color ?? ""
                            ).trim();


                        const piezas =
                            Array.isArray(registro.piezas)
                                ? registro.piezas
                                : [];


                        piezas.forEach(
                            (pieza) => {

                                const personaje =
                                    String(
                                        pieza.personaje ?? ""
                                    ).trim();


                                const rareza =
                                    String(
                                        pieza.rareza ?? ""
                                    ).trim();


                                if (!personaje) {

                                    return;
                                }


                                items.push({
                                    marca:
                                        String(marca).trim(),

                                    coleccion:
                                        coleccion,

                                    color:
                                        color,

                                    personaje:
                                        personaje,

                                    rareza:
                                        rareza || "N/A"
                                });

                            }
                        );

                    }
                );

            }
        );


    return items;
}


/**
 * Devuelve todas las piezas del checklist
 * en formato plano.
 */
export async function getChecklistItems() {

    const data =
        await fetchChecklist();


    return flattenChecklist(
        data
    );
}