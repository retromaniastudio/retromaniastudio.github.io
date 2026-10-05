const SITIO_URL =
    "./data/sitio.json";


/**
 * Carga la configuración general pública del sitio.
 *
 * Actualmente contiene:
 *
 * - Playlist de YouTube.
 * - Redes sociales.
 *
 * El objetivo es que estos datos puedan cambiar
 * modificando únicamente sitio.json.
 */

export async function getSitioConfig() {

    const response =
        await fetch(
            SITIO_URL,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `No fue posible cargar ${SITIO_URL}.`
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
            `${SITIO_URL} no contiene una configuración válida.`
        );
    }


    /*
     * La playlist puede estar vacía.
     * En ese caso Inicio mostrará el placeholder.
     */

    const youtubePlaylist =
        typeof data.youtube_playlist === "string"
            ? data.youtube_playlist.trim()
            : "";


    /*
     * Redes puede ser una lista vacía.
     */

    const redes =
        Array.isArray(data.redes)
            ? data.redes
            : [];


    return {

        youtube_playlist:
            youtubePlaylist,

        redes:
            redes

    };
}