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
 * Crea un nuevo año académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createYear = async (req, res) => {
    try {
        const yearData = req.matchedData || req.body;

        // Verificar el formato del año (XX/XX)
        if (!/^\d{2}\/\d{2}$/.test(yearData.year)) {
            return errorHandler(new Error('INVALID_YEAR_FORMAT'), res);
        }

        // Verificar si ya existe un año con el mismo nombre
        const existingYear = await yearService.findYearByName(yearData.year);
        if (existingYear) {
            return errorHandler(new Error('YEAR_ALREADY_EXISTS'), res);
        }

        const createdYear = await yearService.createYear(yearData);
        createResponse(res, 201, createdYear);
    } catch (error) {
        logger.error('Error creando año académico', { error, yearData: req.body });
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
    createYear,
    deleteYear
};