/**
 * Utilidad para crear errores estandarizados
 * @module utils/errorUtil
 */

/**
 * Crea un error estandarizado con un código de error predefinido
 * @param {string} errorType - Tipo de error predefinido en ERROR_TYPES
 * @param {Object} [details=null] - Detalles adicionales del error
 * @returns {Error} Error con propiedades adicionales
 */
const createError = (errorType, details = null) => {
    const error = new Error(errorType);
    if (details) {
        error.details = details;
    }
    return error;
};

module.exports = { createError };