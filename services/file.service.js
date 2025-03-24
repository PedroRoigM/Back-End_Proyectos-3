/**
 * Servicio para la gestión de archivos
 * @module services/file.service
 */
const { tfgsModel } = require('../models');
const uploadToPinata = require('../utils/UploadToPinata');
const DeleteFilePinata = require('../utils/DeleteFilePinata');
const GetFilePinata = require('../utils/GetFilePinata');
const handlePdfToImg = require('../utils/handlePdfToImg');
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
        logger.error('Error subiendo archivo a Pinata', { error });
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
    const tfg = await tfgsModel.findById(tfgId).select("link");

    if (!tfg || !tfg.link || tfg.link === 'undefined') {
        return { success: false, message: 'No se encontró el archivo a eliminar' };
    }

    try {
        await DeleteFilePinata(tfg.link);

        // Actualizar el TFG para remover el link y marcar como no verificado
        const updatedTFG = await tfgsModel.findByIdAndUpdate(
            tfgId,
            { $set: { link: undefined, verified: false } },
            { new: true }
        );

        return updatedTFG;
    } catch (error) {
        logger.error('Error eliminando archivo de Pinata', { error, tfgId });
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
    const tfg = await tfgsModel.findById(tfgId);

    if (!tfg || !tfg.link || tfg.link === 'undefined') {
        throw new Error('TFG_FILE_NOT_FOUND');
    }

    try {
        const fileBuffer = await GetFilePinata(tfg.link);
        const fileName = `tfg_${tfgId}.pdf`;

        return { fileBuffer, fileName, tfg };
    } catch (error) {
        logger.error('Error obteniendo archivo de Pinata', { error, tfgId });
        throw new Error('ERROR_GETTING_FILE');
    }
};

/**
 * Convierte el PDF de un TFG a imágenes
 * @async
 * @param {string} tfgId - ID del TFG
 * @returns {Promise<Array>} Array de URLs de imágenes
 */
const getPDFImages = async (tfgId) => {
    try {
        const { fileBuffer } = await getTFGFile(tfgId);
        const images = await handlePdfToImg(fileBuffer);
        return images;
    } catch (error) {
        logger.error('Error convirtiendo PDF a imágenes', { error, tfgId });
        throw new Error('ERROR_CONVERTING_PDF');
    }
};

module.exports = {
    uploadFile,
    deleteFile,
    getTFGFile,
    getPDFImages
};