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

    // Guardar datos validados en req.matchedData si se están haciendo validaciones
    if (Object.keys(req.body).length > 0) {
        req.matchedData = req.body;
    }

    next();
};

module.exports = validateResults;