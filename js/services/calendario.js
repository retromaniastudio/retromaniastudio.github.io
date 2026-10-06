const CALENDARIO_URL = "./data/calendario.json";

export async function getCalendario() {
    const response = await fetch(CALENDARIO_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`No fue posible cargar ${CALENDARIO_URL}.`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`${CALENDARIO_URL} no contiene una lista válida.`);
    return data;
}
