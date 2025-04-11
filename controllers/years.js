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
        const active = req.matchedData;
        let years;
        if (active) {
            years = await yearService.getAll(active);
        } else {
            years = await yearService.getAll();
        }
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
        const year = await yearService.getById(id);
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
        const updateData = req.matchedData;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Verificar que el año existe
        const year = await yearService.getById(id);
        if (!year) {
            return errorHandler(new Error('YEAR_NOT_FOUND'), res);
        }

        // Verificar formato del año si se está actualizando
        if (updateData.year && !/^\d{2}\/\d{2}$/.test(updateData.year)) {
            return errorHandler(new Error('INVALID_YEAR_FORMAT'), res);
        }

        // Si se está actualizando el año, verificar que no exista otro con ese nombre
        if (updateData.year) {
            const existingYear = await yearService.findByName(updateData.year);
            if (existingYear && existingYear._id.toString() !== id) {
                return errorHandler(new Error('YEAR_ALREADY_EXISTS'), res);
            }
        }

        const updatedYear = await yearService.update(id, updateData);
        createResponse(res, 200, updatedYear);
    } catch (error) {
        logger.error(`Error actualizando año académico ${req.params.id}`, { error, updateData: req.matchedData });
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
        const response = await yearService.delete(id);
        createResponse(res, 200, response);
    } catch (error) {
        logger.error(`Error eliminando año académico ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un año académico por su nombre
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getYearsByName = async (req, res) => {
    try {
        const year = req.matchedData;
        const result = await yearService.findByName(year.year);
        createResponse(res, 200, result);
    } catch (error) {
        logger.error(`Error obteniendo año académico por nombre ${req.params.name}`, { error });
        errorHandler(error, res);
    }
}

module.exports = {
    getYears,
    getYear,
    getCurrentYear,
    createYear,
    updateYear,
    deleteYear,
    getYearsByName
};