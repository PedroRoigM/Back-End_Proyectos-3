/**
 * Utilidad para obtener archivos de Pinata IPFS
 * @module utils/GetFilePinata
 */
const config = require('../config');
const logger = require('./logger');

/**
 * Obtiene un archivo desde Pinata IPFS
 * @async
 * @param {string} url_file - URL del archivo en Pinata
 * @returns {Promise<ArrayBuffer|Object>} Contenido del archivo (ArrayBuffer para binarios, Object para JSON)
 * @throws {Error} Si ocurre algún error durante el proceso
 */
const GetFilePinata = async (url_file) => {
    try {
        // Validar URL
        if (!url_file) {
            throw new Error("FILE_URL_INVALID");
        }

        logger.info(`Obteniendo archivo desde: ${url_file}`);

        const response = await fetch(url_file, {
            method: 'GET',
            headers: {
                'pinata_api_key': config.PINATA_API_KEY,
                'pinata_secret_api_key': config.PINATA_SECRET_KEY
            }
        });

        if (!response.ok) {
            logger.error(`Error en respuesta de Pinata: ${response.status}`, {
                statusText: response.statusText
            });
            throw new Error("PINATA_FETCH_ERROR");
        }

        const contentType = response.headers.get('content-type');
        logger.debug(`Tipo de contenido recibido: ${contentType}`);

        // Determinar el tipo de retorno basado en el Content-Type
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            return jsonData;
        } else {
            // Para archivos binarios como PDFs, imágenes, etc.
            const bufferData = await response.arrayBuffer();
            return bufferData;
        }
    } catch (error) {
        // Si es un error que ya generamos, propagarlo
        if (error.message === "FILE_URL_INVALID" || error.message === "PINATA_FETCH_ERROR") {
            throw error;
        }

        // Para otros errores (red, parsing, etc.)
        logger.error('Error al obtener archivo de Pinata', {
            error: error.message,
            url: url_file
        });
        throw new Error("FILE_FETCH_ERROR");
    }
};

module.exports = GetFilePinata;