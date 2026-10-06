const COLECCIONABLES_URL = "./data/coleccionables.json";

export async function getColeccionables() {
    const response = await fetch(COLECCIONABLES_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`No fue posible cargar ${COLECCIONABLES_URL}.`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`${COLECCIONABLES_URL} no contiene una lista válida.`);
    return data;
}
