/**
 * Servicio para la gestión de archivos
 * @module services/file.service
 */
const { tfgsModel } = require('../models');
const uploadToPinata = require('../utils/UploadToPinata');
const DeleteFilePinata = require('../utils/DeleteFilePinata');
const GetFilePinata = require('../utils/GetFilePinata');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Sube un archivo a Pinata
 * @async
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} fileName - Nombre del archivo
 * @returns {Promise<string>} URL del archivo subido
 */
const uploadFile = async (fileBuffer, fileName) => {
    try {
        const pinataResponse = await uploadToPinata(fileBuffer, fileName);
        const ipfsFile = pinataResponse.IpfsHash;
        return `https://${config.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
    } catch (error) {
        logger.error('Error subiendo archivo a Pinata', { error, fileName });
        throw new Error('ERROR_UPLOADING_FILE');
    }
};

/**
 * Elimina un archivo asociado a un TFG
 * @async
 * @param {string} tfgId - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const deleteFile = async (tfgId) => {
    try {
        const tfg = await tfgsModel.findById(tfgId).select("link");

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        if (!tfg.link || tfg.link === 'undefined') {
            // No hay archivo para eliminar, pero no es un error
            return { success: true, message: 'No se encontró el archivo a eliminar' };
        }

        await DeleteFilePinata(tfg.link);

        // Actualizar el TFG para remover el link y marcar como no verificado
        const updatedTFG = await tfgsModel.findByIdAndUpdate(
            tfgId,
            { $set: { link: undefined, verified: false } },
            { new: true }
        );

        return updatedTFG;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS' ||
            error.message === 'FILE_URL_INVALID' ||
            error.message === 'CID_NOT_FOUND' ||
            error.message === 'PINATA_API_ERROR') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${tfgId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando archivo de TFG ${tfgId}`, { error });
        throw new Error('ERROR_DELETING_FILE');
    }
};

/**
 * Obtiene el archivo PDF de un TFG
 * @async
 * @param {string} tfgId - ID del TFG
 * @returns {Promise<Object>} Buffer del archivo y nombre
 */
const getTFGFile = async (tfgId) => {
    try {
        const tfg = await tfgsModel.findById(tfgId);

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        if (!tfg.link || tfg.link === 'undefined') {
            throw new Error('TFG_FILE_NOT_FOUND');
        }

        const fileBuffer = await GetFilePinata(tfg.link);
        const fileName = `tfg_${tfgId}.pdf`;

        return { fileBuffer, fileName, tfg };
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS' ||
            error.message === 'TFG_FILE_NOT_FOUND' ||
            error.message === 'FILE_URL_INVALID' ||
            error.message === 'PINATA_FETCH_ERROR' ||
            error.message === 'FILE_FETCH_ERROR') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${tfgId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo archivo de TFG ${tfgId}`, { error });
        throw new Error('ERROR_GETTING_FILE');
    }
};

module.exports = {
    uploadFile,
    deleteFile,
    getTFGFile
};