/**
 * Utilidad para eliminar archivos de Pinata IPFS
 * @module utils/DeleteFilePinata
 */
const config = require('../config');
const logger = require('./logger');

/**
 * Elimina un archivo de Pinata IPFS usando su CID
 * @async
 * @param {string} url_file - URL del archivo en Pinata
 * @returns {Promise<boolean>} true si la eliminación fue exitosa
 * @throws {Error} Si ocurre algún error durante el proceso
 */
const DeleteFilePinata = async (url_file) => {
    try {
        // Validar URL
        if (!url_file) {
            throw new Error("FILE_URL_INVALID");
        }

        // Extraer el CID desde la URL del archivo
        const cidMatch = url_file.match(/ipfs\/(.+)$/);
        if (!cidMatch) {
            throw new Error("CID_NOT_FOUND");
        }

        const cid = cidMatch[1];
        logger.info(`Eliminando archivo con CID: ${cid}`);

        // Llamar al endpoint de Pinata
        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'pinata_api_key': config.PINATA_API_KEY,
                'pinata_secret_api_key': config.PINATA_SECRET_KEY
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`Error en respuesta de Pinata: ${response.status}`, { errorText });
            throw new Error("PINATA_API_ERROR");
        }

        logger.info(`Archivo con CID ${cid} eliminado correctamente`);
        return true;
    } catch (error) {
        // Registrar el error pero propagarlo para que lo maneje el servicio
        logger.error('Error al eliminar archivo de Pinata', {
            error: error.message,
            url: url_file
        });
        throw error;
    }
};

module.exports = DeleteFilePinata;