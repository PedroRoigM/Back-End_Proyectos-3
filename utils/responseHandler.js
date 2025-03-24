/**
 * Utilidad para manejo estandarizado de respuestas HTTP
 * @module utils/responseHandler
 */

/**
 * Códigos de error personalizados 
 */
const ERROR_TYPES = {
    // Errores de autenticación y autorización
    NOT_TOKEN: { code: 401, message: 'No se proporcionó token de autenticación' },
    INVALID_TOKEN: { code: 401, message: 'Token de autenticación inválido' },
    EMAIL_NOT_VALIDATED: { code: 401, message: 'El correo electrónico no ha sido validado' },
    NOT_ALLOWED: { code: 403, message: 'No tienes permisos para realizar esta acción' },
    UNAUTHORIZED_ACTION: { code: 403, message: 'Acción no autorizada' },

    // Errores de validación
    VALIDATION_ERROR: { code: 422, message: 'Error de validación en los datos proporcionados' },
    INVALID_ID: { code: 400, message: 'ID inválido' },
    INVALID_YEAR_FORMAT: { code: 400, message: 'Formato de año inválido. Debe ser XX/XX' },

    // Errores de recursos
    USER_NOT_EXISTS: { code: 404, message: 'El usuario no existe' },
    TFG_NOT_EXISTS: { code: 404, message: 'El TFG no existe' },
    TFG_NOT_VERIFIED: { code: 403, message: 'El TFG no está verificado' },

    // Errores de duplicación
    EMAIL_ALREADY_EXISTS: { code: 409, message: 'El correo electrónico ya está registrado' },
    DEGREE_ALREADY_EXISTS: { code: 409, message: 'El grado académico ya existe' },
    YEAR_ALREADY_EXISTS: { code: 409, message: 'El año académico ya existe' },
    ADVISOR_ALREADY_EXISTS: { code: 409, message: 'El tutor ya existe' },

    // Errores de relaciones
    DEGREE_IN_USE: { code: 409, message: 'El grado académico está asociado a TFGs existentes' },
    YEAR_IN_USE: { code: 409, message: 'El año académico está asociado a TFGs existentes' },
    ADVISOR_IN_USE: { code: 409, message: 'El tutor está asociado a TFGs existentes' },

    // Errores de archivos
    NO_FILE_UPLOADED: { code: 400, message: 'No se ha subido ningún archivo' },
    INVALID_FILE_TYPE: { code: 400, message: 'Tipo de archivo inválido. Solo se aceptan archivos PDF' },
    ERROR_UPLOADING_FILE: { code: 500, message: 'Error al subir el archivo' },

    // Errores generales
    DEFAULT_ERROR: { code: 500, message: 'Error interno del servidor' }
};

/**
 * Crea una respuesta HTTP estandarizada
 * @param {Object} res - Objeto de respuesta Express
 * @param {number} status - Código de estado HTTP
 * @param {*} data - Datos a enviar (opcional)
 * @param {string} message - Mensaje opcional
 */
const createResponse = (res, status, data = null, message = null) => {
    const response = {};

    if (data !== null) {
        if (Array.isArray(data)) {
            response.data = data;
            response.count = data.length;
        } else if (typeof data === 'object') {
            Object.assign(response, data);
        } else {
            response.data = data;
        }
    }

    if (message) {
        response.message = message;
    }

    return res.status(status).json(response);
};

/**
 * Maneja errores de forma estandarizada
 * @param {Error} error - Error a manejar
 * @param {Object} res - Objeto de respuesta Express
 */
const errorHandler = (error, res) => {
    const errorName = error.message || 'DEFAULT_ERROR';
    const errorInfo = ERROR_TYPES[errorName] || ERROR_TYPES.DEFAULT_ERROR;

    const status = errorInfo.code;
    const message = errorInfo.message;

    return res.status(status).json({
        error: errorName,
        message: message,
        status: status
    });
};

module.exports = {
    createResponse,
    errorHandler,
    ERROR_TYPES
};