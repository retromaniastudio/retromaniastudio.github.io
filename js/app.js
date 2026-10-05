import {
    initializeRouter
} from "./router.js";


/**
 * Punto de entrada de la aplicación web.
 *
 * En esta primera versión su única responsabilidad
 * consiste en iniciar el router una vez que el DOM
 * se encuentra disponible.
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeRouter();

    }
);