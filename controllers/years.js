/**
 * Controlador de años académicos
 * @module controllers/years
 */
const yearService = require('../services/year.service');
const { createResponse, errorHandler } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Obtiene todos los años académicos
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getYears = async (req, res) => {
    try {
        const onlyActive = req.query.active === 'true';
        const years = await yearService.getAllYears(onlyActive);
        createResponse(res, 200, years);
    } catch (error) {
        logger.error('Error obteniendo años académicos', { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un año académico por su ID
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getYear = async (req, res) => {
    try {
        const { id } = req.params;
        const year = await yearService.getYearById(id);
        createResponse(res, 200, year);
    } catch (error) {
        logger.error(`Error obteniendo año académico ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene el año académico actual
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getCurrentYear = async (req, res) => {
    try {
        const currentYear = await yearService.getCurrentYear();
        if (!currentYear) {
            return errorHandler(new Error('YEAR_NOT_FOUND'), res);
        }
        createResponse(res, 200, currentYear);
    } catch (error) {
        logger.error('Error obteniendo año académico actual', { error });
        errorHandler(error, res);
    }
};

/**
 * Crea un nuevo año académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createYear = async (req, res) => {
    try {
        const createdYear = await yearService.createYear();
        createResponse(res, 201, createdYear);
    } catch (error) {
        logger.error('Error creando año académico', { error });
        errorHandler(error, res);
    }
};

/**
 * Actualiza un año académico existente
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateYear = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Verificar que el año existe
        const year = await yearService.getYearById(id);
        if (!year) {
            return errorHandler(new Error('YEAR_NOT_FOUND'), res);
        }

        // Verificar formato del año si se está actualizando
        if (updateData.year && !/^\d{2}\/\d{2}$/.test(updateData.year)) {
            return errorHandler(new Error('INVALID_YEAR_FORMAT'), res);
        }

        // Si se está actualizando el año, verificar que no exista otro con ese nombre
        if (updateData.year) {
            const existingYear = await yearService.findYearByName(updateData.year);
            if (existingYear && existingYear._id.toString() !== id) {
                return errorHandler(new Error('YEAR_ALREADY_EXISTS'), res);
            }
        }

        const updatedYear = await yearService.updateYear(id, updateData);
        createResponse(res, 200, updatedYear);
    } catch (error) {
        logger.error(`Error actualizando año académico ${req.params.id}`, { error, updateData: req.body });
        errorHandler(error, res);
    }
};

/**
 * Elimina un año académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const deleteYear = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el año existe
        const year = await yearService.getYearById(id);
        if (!year) {
            return errorHandler(new Error('YEAR_NOT_FOUND'), res);
        }

        // Verificar si el año está asociado a TFGs
        const isUsed = await yearService.isYearUsedInTFGs(id);
        if (isUsed) {
            return errorHandler(new Error('YEAR_IN_USE'), res);
        }

        const deletedYear = await yearService.deleteYear(id);
        createResponse(res, 200, deletedYear);
    } catch (error) {
        logger.error(`Error eliminando año académico ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

module.exports = {
    getYears,
    getYear,
    getCurrentYear,
    createYear,
    updateYear,
    deleteYear
};