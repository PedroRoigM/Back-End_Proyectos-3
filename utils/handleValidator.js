const { validationResult } = require("express-validator");

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
        return res.status(400).json({
            errors: errors.array().map(error => ({
                param: error.param,
                msg: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

module.exports = validateResults;
