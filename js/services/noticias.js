const NOTICIAS_RECIENTES_URL =
    "./data/noticias_recientes.json";

const NOTICIAS_ANTERIORES_URL =
    "./data/noticias_anteriores.json";


async function fetchNoticias(url) {

    const response = await fetch(
        url,
        {
            cache: "no-store"
        }
    );


    if (!response.ok) {

        throw new Error(
            `No fue posible cargar ${url}.`
        );
    }


    const data = await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            `El archivo ${url} no contiene una lista válida de noticias.`
        );
    }


    return data;
}


export async function getNoticiasRecientes() {

    return fetchNoticias(
        NOTICIAS_RECIENTES_URL
    );
}


export async function getNoticiasAnteriores() {

    return fetchNoticias(
        NOTICIAS_ANTERIORES_URL
    );
}