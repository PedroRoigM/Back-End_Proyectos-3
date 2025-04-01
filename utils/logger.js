/**
 * Módulo de logging mejorado
 * @module utils/logger
 */

const logger = {
    info: (message, meta = {}) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
    },

    error: (message, meta = {}) => {
        // Extraer información del error si está presente
        if (meta.error && meta.error instanceof Error) {
            const { name, message: errorMessage, stack } = meta.error;
            meta.errorInfo = { name, message: errorMessage };
            if (process.env.NODE_ENV !== 'production') {
                meta.errorInfo.stack = stack;
            }
            delete meta.error; // Evitar circular references
        }
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
    },

    warn: (message, meta = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
    },

    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
        }
    }
};

module.exports = logger;