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
    TFG_FILE_NOT_FOUND: { code: 404, message: 'No se encontró el archivo del TFG' },
    ADVISOR_NOT_FOUND: { code: 404, message: 'No se encontró el tutor' },
    DEGREE_NOT_FOUND: { code: 404, message: 'No se encontró el grado académico' },
    YEAR_NOT_FOUND: { code: 404, message: 'No se encontró el año académico' },

    // Errores de duplicación
    EMAIL_ALREADY_EXISTS: { code: 409, message: 'El correo electrónico ya está registrado' },
    DEGREE_ALREADY_EXISTS: { code: 409, message: 'El grado académico ya existe' },
    YEAR_ALREADY_EXISTS: { code: 409, message: 'El año académico ya existe' },
    ADVISOR_ALREADY_EXISTS: { code: 409, message: 'El tutor ya existe' },
    SAME_PASSWORD: { code: 409, message: 'La nueva contraseña debe ser diferente a la actual' },

    // Errores de relaciones 
    DEGREE_IN_USE: { code: 409, message: 'El grado académico está asociado a TFGs existentes' },
    YEAR_IN_USE: { code: 409, message: 'El año académico está asociado a TFGs existentes' },
    ADVISOR_IN_USE: { code: 409, message: 'El tutor está asociado a TFGs existentes' },

    // Errores de archivos
    NO_FILE_UPLOADED: { code: 400, message: 'No se ha subido ningún archivo' },
    INVALID_FILE_TYPE: { code: 400, message: 'Tipo de archivo inválido. Solo se aceptan archivos PDF' },
    ERROR_UPLOADING_FILE: { code: 500, message: 'Error al subir el archivo' },
    FILE_FETCH_ERROR: { code: 500, message: 'Error al obtener el archivo' },
    PINATA_API_ERROR: { code: 500, message: 'Error en la API de Pinata' },
    PINATA_FETCH_ERROR: { code: 500, message: 'Error al obtener archivo de Pinata' },
    ERROR_CONVERTING_PDF: { code: 500, message: 'Error al convertir PDF a imágenes' },
    FILE_URL_INVALID: { code: 400, message: 'URL de archivo inválida' },
    CID_NOT_FOUND: { code: 404, message: 'No se encontró el CID en la URL' },

    // Errores de autenticación
    INVALID_PASSWORD: { code: 401, message: 'Contraseña incorrecta' },
    INVALID_CODE: { code: 401, message: 'Código de verificación inválido' },
    MAX_ATTEMPTS: { code: 401, message: 'Número máximo de intentos excedido' },
    ACCOUNT_LOCKED: { code: 401, message: 'Cuenta bloqueada por demasiados intentos fallidos' },

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
    const response = {
        success: status >= 200 && status < 300
    };

    if (data !== null) {
        if (Array.isArray(data)) {
            response.data = data;
            response.count = data.length;
        } else if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            if (data.hasOwnProperty('data')) {
                // Si ya tiene la estructura correcta
                Object.assign(response, data);
            } else {
                // Si es un objeto simple
                response.data = data;
            }
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
    const errorType = error.message || 'DEFAULT_ERROR';
    const errorInfo = ERROR_TYPES[errorType] || ERROR_TYPES.DEFAULT_ERROR;

    const status = error.status || errorInfo.code || 500;
    const message = errorInfo.message || 'Error interno del servidor';

    // Loggear el error
    const logger = require('./logger');
    logger.error(`Error manejado: ${errorType}`, { error });

    const response = {
        success: false,
        error: errorType,
        message: message,
        status: status
    };

    // Si existen detalles adicionales y estamos en desarrollo
    if (error.details && process.env.NODE_ENV !== 'production') {
        response.details = error.details;
    }

    return res.status(status).json(response);
};

module.exports = {
    createResponse,
    errorHandler,
    ERROR_TYPES
};