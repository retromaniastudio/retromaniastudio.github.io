export function escapeHtml(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   FECHA
   ========================================================= */

export function formatNewsDate(dateValue) {

    if (!dateValue) {

        return "";
    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {

        return escapeHtml(
            dateValue
        );
    }


    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}


/* =========================================================
   MARKDOWN SIMPLE
   ========================================================= */

/**
 * Convierte únicamente la sintaxis de negritas:
 *
 * **texto**
 *
 * en:
 *
 * <strong>texto</strong>
 *
 * IMPORTANTE:
 *
 * El texto debe llegar previamente protegido mediante
 * escapeHtml(). De esta forma no permitimos que el contenido
 * del JSON introduzca HTML arbitrario en la página.
 */

function applySimpleMarkdown(
    escapedText
) {

    return escapedText.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );
}


/**
 * Elimina las marcas Markdown que no queremos mostrar
 * dentro de los resúmenes de Inicio.
 *
 * Ejemplo:
 *
 * "Tenemos una **promoción especial**."
 *
 * se convierte en:
 *
 * "Tenemos una promoción especial."
 */

function removeSimpleMarkdown(
    text
) {

    return String(text)
        .replace(
            /\*\*(.+?)\*\*/g,
            "$1"
        );
}


/* =========================================================
   RESUMEN DE NOTICIA
   ========================================================= */

export function createExcerpt(
    content,
    maxLength = 220
) {

    const withoutMarkdown =
        removeSimpleMarkdown(
            content ?? ""
        );


    const normalized =
        withoutMarkdown
            .replace(/\s+/g, " ")
            .trim();


    if (
        normalized.length
        <= maxLength
    ) {

        return normalized;
    }


    return (
        normalized
            .slice(
                0,
                maxLength
            )
            .trimEnd()
        + "..."
    );
}


/* =========================================================
   IMAGEN DE NOTICIA
   ========================================================= */

export function resolveNewsImage(
    imageName
) {

    const image =
        String(imageName ?? "")
            .trim();


    /*
     * Si no se proporcionó imagen o se especificó
     * explícitamente logo.png, utilizamos el logo
     * general de Retromania Studio.
     */

    if (
        !image
        || image.toLowerCase() === "logo.png"
    ) {

        return "./img/general/logo.png";
    }


    /*
     * Si el JSON contiene una ruta completa,
     * la respetamos.
     */

    if (
        image.startsWith("./")
        || image.startsWith("../")
        || image.startsWith("/")
        || image.startsWith("http://")
        || image.startsWith("https://")
    ) {

        return image;
    }


    /*
     * Si únicamente se proporciona el nombre
     * del archivo, asumimos que pertenece a
     * /img/noticias/.
     */

    return `./img/noticias/${image}`;
}


/* =========================================================
   CONTENIDO COMPLETO DE NOTICIA
   ========================================================= */

export function formatNewsContent(
    content
) {

    /*
     * Una línea completamente vacía separa
     * un párrafo de otro.
     */

    const paragraphs =
        String(content ?? "")
            .split(/\n\s*\n/)
            .map(
                (paragraph) =>
                    paragraph.trim()
            )
            .filter(Boolean);


    if (
        paragraphs.length === 0
    ) {

        return `
            <p>
                Esta noticia no contiene información adicional.
            </p>
        `;
    }


    return paragraphs
        .map(
            (paragraph) => {

                /*
                 * Primero protegemos cualquier HTML que
                 * pudiera venir dentro del JSON.
                 */

                const escapedParagraph =
                    escapeHtml(
                        paragraph
                    );


                /*
                 * Después procesamos exclusivamente nuestra
                 * sintaxis permitida de negritas.
                 */

                const formattedParagraph =
                    applySimpleMarkdown(
                        escapedParagraph
                    );


                return `
                    <p>
                        ${formattedParagraph}
                    </p>
                `;

            }
        )
        .join("");
}