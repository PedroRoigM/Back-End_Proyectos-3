const { validationResult } = require("express-validator");
const { errorHandler } = require("./responseHandler");

/**
 * Función para manejar los resultados de validación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función middleware siguiente
 * @returns {Object|Function} - Retorna error o continúa con el siguiente middleware
 */
const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Crear un error personalizado para errorHandler
        const error = new Error('VALIDATION_ERROR');
        error.details = errors.array().map(error => ({
            param: error.param,
            msg: error.message,
            value: error.value
        }));
        return errorHandler(error, res);
    }

    // Combinar datos validados de body, params, y query
    req.matchedData = {
        ...req.body,
        ...req.params,
        ...req.query
    };

    // Eliminar campos undefined o null
    Object.keys(req.matchedData).forEach(key => {
        if (req.matchedData[key] === undefined || req.matchedData[key] === null) {
            delete req.matchedData[key];
        }
    });

    next();
};

module.exports = validateResults;