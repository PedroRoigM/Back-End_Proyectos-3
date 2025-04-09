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
        const tfgs = await tfgService.getAllTFGTitles();
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
        const tfgs = await tfgService.getAll(filters);
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
        let isRestrictedUser = req.user && !["administrador", "coordinador"].includes(req.user.role);
        // Primero verificar si el TFG existe sin filtros de verificación
        const tfgExists = await tfgService.getTFGById(id, !isRestrictedUser);

        if (!tfgExists) {
            return createResponse(res, 404, { message: "TFG no encontrado" });
        }

        // Agregar filtro de verificación para usuarios restringidos
        if (isRestrictedUser && tfgExists.verified === false) {
            return createResponse(res, 403, { message: "Acceso denegado a TFG no verificado" });
        }
        // Incrementar las views
        await tfgService.incrementTFGViews(id);
        return createResponse(res, 200, tfgExists);


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
        const filters = { ...req.query, ...req.matchedData };

        // Validar que page_number es un número válido
        const pageNumber = parseInt(page_number);
        if (isNaN(pageNumber) || pageNumber < 1) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const result = await tfgService.getPaginatedTFGs(filters, pageNumber);
        createResponse(res, 200, result);
    } catch (error) {
        logger.error('Error obteniendo TFGs paginados', { error, page: req.params.page_number, filters: req.matchedData });
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
        const tfgData = req.matchedData;

        if (!tfgData || Object.keys(tfgData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Validar que existan el año y el grado
        await tfgService.validateYearAndDegree(tfgData.year, tfgData.degree);

        // Procesar keywords si vienen como string
        if (typeof tfgData.keywords === 'string') {
            tfgData.keywords = tfgData.keywords.split(',').map(kw => kw.trim());
        }

        const createdTFG = await tfgService.create({
            ...tfgData,
            link: "undefined", // El link se actualizará después con el archivo
            createdBy: req.user._id
        });

        createResponse(res, 201, createdTFG);
    } catch (error) {
        logger.error('Error creando TFG', { error, tfgData: req.matchedData });
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
        const updateData = req.matchedData;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Validar que existan el año y el grado
        await tfgService.validateYearAndDegree(updateData.year, updateData.degree);

        // Procesar keywords si vienen como string
        if (typeof updateData.keywords === 'string') {
            updateData.keywords = updateData.keywords.split(',').map(kw => kw.trim());
        }

        const updatedTFG = await tfgService.update(id, updateData);
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

        // Eliminar primero el archivo asociado (ignorar errores en esta parte)
        try {
            await fileService.deleteFile(id);
        } catch (fileError) {
            logger.warn(`No se pudo eliminar el archivo del TFG ${id}`, { fileError });
        }

        // Eliminar el TFG
        await tfgService.delete(id);

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
        const updatedTFG = await tfgService.update(id, { link: fileUrl });

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

        const updatedTFG = await tfgService.verifyTFG(id);

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

        // Incrementa contador de descargas (ignorar errores para no afectar la descarga principal)
        try {
            await tfgService.incrementTFGDownloads(id);
        } catch (downloadError) {
            logger.warn(`No se pudo incrementar descargas para TFG ${id}`, { downloadError });
        }

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
 * Obtiene TFGs no verificados
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getUnverifiedTFGs = async (req, res) => {
    try {
        const { page_number } = req.params;
        const filters = { ...req.query, ...req.matchedData, verified: false };

        // Validar que page_number es un número válido
        const pageNumber = parseInt(page_number);
        if (isNaN(pageNumber) || pageNumber < 1) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const result = await tfgService.getPaginatedTFGs(filters, pageNumber);
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
    getUnverifiedTFGs
};