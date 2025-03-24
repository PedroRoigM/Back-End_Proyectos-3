/**
 * Controlador de grados académicos
 * @module controllers/degrees
 */
const degreeService = require('../services/degree.service');
const { createResponse, errorHandler } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Obtiene todos los grados académicos
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getDegrees = async (req, res) => {
    try {
        const onlyActive = req.query.active === 'true';
        const degrees = await degreeService.getAllDegrees(onlyActive);
        createResponse(res, 200, degrees);
    } catch (error) {
        logger.error('Error obteniendo grados académicos', { error });
        errorHandler(error, res);
    }
};

/**
 * Crea un nuevo grado académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createDegree = async (req, res) => {
    try {
        const degreeData = req.matchedData || req.body;

        // Verificar si ya existe un grado con el mismo nombre
        const existingDegree = await degreeService.findDegreeByName(degreeData.degree);
        if (existingDegree) {
            return errorHandler(new Error('DEGREE_ALREADY_EXISTS'), res);
        }

        const createdDegree = await degreeService.createDegree(degreeData);
        createResponse(res, 201, createdDegree);
    } catch (error) {
        logger.error('Error creando grado académico', { error, degreeData: req.body });
        errorHandler(error, res);
    }
};

/**
 * Elimina un grado académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const deleteDegree = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el grado está asociado a TFGs
        const isUsed = await degreeService.isDegreeUsedInTFGs(id);
        if (isUsed) {
            return errorHandler(new Error('DEGREE_IN_USE'), res);
        }

        const deletedDegree = await degreeService.deleteDegree(id);
        createResponse(res, 200, deletedDegree);
    } catch (error) {
        logger.error(`Error eliminando grado académico ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

module.exports = {
    getDegrees,
    createDegree,
    deleteDegree
};