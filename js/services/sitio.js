const SITIO_URL = "./data/sitio.json";

export async function getSitioConfig() {
    const response = await fetch(SITIO_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`No fue posible cargar ${SITIO_URL}.`);

    const data = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(`${SITIO_URL} no contiene una configuración válida.`);
    }

    return {
        hero: data.hero && typeof data.hero === "object" ? data.hero : {},
        youtube_playlist: typeof data.youtube_playlist === "string" ? data.youtube_playlist.trim() : "",
        redes: Array.isArray(data.redes) ? data.redes : []
    };
}
