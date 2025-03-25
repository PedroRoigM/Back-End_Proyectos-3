/**
 * Controlador de TFGs
 * @module controllers/tfgs
 */
const tfgService = require('../services/tfg.service');
const fileService = require('../services/file.service');
const { createResponse, errorHandler } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Obtiene lista resumida de nombres de TFGs
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getTFGsNames = async (req, res) => {
    try {
        const tfgs = await tfgService.getTFGNames();
        createResponse(res, 200, tfgs);
    } catch (error) {
        logger.error('Error obteniendo nombres de TFGs', { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene todos los TFGs
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getTFGs = async (req, res) => {
    try {
        const filters = req.query;
        const tfgs = await tfgService.getAllTFGs(filters);
        createResponse(res, 200, tfgs);
    } catch (error) {
        logger.error('Error obteniendo TFGs', { error, filters: req.query });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un TFG por su ID
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getTFG = async (req, res) => {
    try {
        const { id } = req.params;
        var verified = false;
        // Solo mostrar TFGs verificados a usuarios normales
        if (["administrador", "coordinador"].includes(req.user.role)) {
            const verified = true;
        }

        const tfg = await tfgService.getTFGById(id, verified);

        // Incrementa contador de visualizaciones
        await tfgService.incrementTFGViews(id);

        createResponse(res, 200, tfg);
    } catch (error) {
        logger.error(`Error obteniendo TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene TFGs paginados con filtros
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getNextTFGS = async (req, res) => {
    try {
        const { page_number } = req.params;
        const filters = { ...req.query, ...req.body };

        // Solo mostrar TFGs verificados a usuarios normales
        if (['administrador', 'coordinador'].includes(req.user.role)) {
            filters.verified = true;
        }

        const result = await tfgService.getPaginatedTFGs(filters, parseInt(page_number));
        createResponse(res, 200, result);
    } catch (error) {
        logger.error('Error obteniendo TFGs paginados', { error, page: req.params.page_number, filters: req.body });
        errorHandler(error, res);
    }
};

/**
 * Crea un nuevo TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createTFG = async (req, res) => {
    try {
        const tfgData = req.body;

        // Validar que existan el año y el grado
        await tfgService.validateYearAndDegree(tfgData.year, tfgData.degree);

        // Procesar keywords si vienen como string
        if (typeof tfgData.keywords === 'string') {
            tfgData.keywords = tfgData.keywords.split(',').map(kw => kw.trim());
        }

        const createdTFG = await tfgService.createTFG({
            ...tfgData,
            link: "undefined", // El link se actualizará después con el archivo
            createdBy: req.user._id
        });

        createResponse(res, 201, createdTFG);
    } catch (error) {
        logger.error('Error creando TFG', { error, tfgData: req.body });
        errorHandler(error, res);
    }
};

/**
 * Actualiza un TFG completamente
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const putTFG = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validar que existan el año y el grado
        await tfgService.validateYearAndDegree(updateData.year, updateData.degree);

        // Procesar keywords si vienen como string
        if (typeof updateData.keywords === 'string') {
            updateData.keywords = updateData.keywords.split(',').map(kw => kw.trim());
        }

        const updatedTFG = await tfgService.updateTFG(id, updateData);
        createResponse(res, 200, updatedTFG);
    } catch (error) {
        logger.error(`Error actualizando TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Elimina un TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const deleteTFG = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar primero el archivo asociado
        await fileService.deleteFile(id);

        // Eliminar el TFG
        await tfgService.deleteTFG(id);

        createResponse(res, 204);
    } catch (error) {
        logger.error(`Error eliminando TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Sube o actualiza el archivo PDF de un TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const patchFileTFG = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return errorHandler(new Error('NO_FILE_UPLOADED'), res);
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;

        // Validar el tipo de archivo
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            return errorHandler(new Error('INVALID_FILE_TYPE'), res);
        }

        // Subir archivo y actualizar TFG
        const fileUrl = await fileService.uploadFile(fileBuffer, fileName);
        const updatedTFG = await tfgService.updateTFGFile(id, fileUrl);

        createResponse(res, 200, updatedTFG);
    } catch (error) {
        logger.error(`Error actualizando archivo de TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Verifica un TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const patchVerifiedTFG = async (req, res) => {
    try {
        const { id } = req.params;
        const { verified, reason } = req.body;

        const updatedTFG = await tfgService.verifyTFG(id, {
            verified,
            reason,
            verifiedBy: req.user._id
        });

        createResponse(res, 200, updatedTFG);
    } catch (error) {
        logger.error(`Error verificando TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene el archivo PDF de un TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getFileTFG = async (req, res) => {
    try {
        const { id } = req.params;

        // Incrementa contador de descargas
        await tfgService.incrementTFGDownloads(id);

        // Obtener el archivo
        const { fileBuffer, fileName } = await fileService.getTFGFile(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'tfg_' + id + '.pdf'}"`);
        res.send(Buffer.from(fileBuffer));
    } catch (error) {
        logger.error(`Error obteniendo archivo de TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene imágenes de las páginas del PDF de un TFG
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getFilePhotosTFG = async (req, res) => {
    try {
        const { id } = req.params;
        const images = await fileService.getPDFImages(id);
        createResponse(res, 200, images);
    } catch (error) {
        logger.error(`Error obteniendo imágenes de TFG ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene TFGs no verificados
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getUnverifiedTFGs = async (req, res) => {
    try {
        const { page_number } = req.params;
        const filters = { ...req.query, ...req.body, verified: false };

        const result = await tfgService.getPaginatedTFGs(filters, parseInt(page_number));
        createResponse(res, 200, result);
    } catch (error) {
        logger.error('Error obteniendo TFGs no verificados', { error, page: req.params.page_number });
        errorHandler(error, res);
    }
};

module.exports = {
    getTFGs,
    getTFG,
    getTFGsNames,
    getNextTFGS,
    createTFG,
    putTFG,
    deleteTFG,
    patchFileTFG,
    patchVerifiedTFG,
    getFileTFG,
    getFilePhotosTFG,
    getUnverifiedTFGs
};