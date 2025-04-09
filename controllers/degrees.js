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
        const degrees = await degreeService.getAll(onlyActive);
        createResponse(res, 200, degrees);
    } catch (error) {
        logger.error('Error obteniendo grados académicos', { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un grado académico por su ID
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getDegree = async (req, res) => {
    try {
        const { id } = req.params;
        const degree = await degreeService.getById(id);
        createResponse(res, 200, degree);
    } catch (error) {
        logger.error(`Error obteniendo grado académico ${req.params.id}`, { error });
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
        const degreeData = req.matchedData;

        if (!degreeData || !degreeData.degree) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const createdDegree = await degreeService.create(degreeData);
        createResponse(res, 201, createdDegree);
    } catch (error) {
        logger.error('Error creando grado académico', { error, degreeData: req.matchedData });
        errorHandler(error, res);
    }
};

/**
 * Actualiza un grado académico
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateDegree = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.matchedData;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const updatedDegree = await degreeService.update(id, updateData);
        createResponse(res, 200, updatedDegree);
    } catch (error) {
        logger.error(`Error actualizando grado académico ${req.params.id}`, { error, updateData: req.matchedData });
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
        const response = await degreeService.delete(id);
        createResponse(res, 200, response);
    } catch (error) {
        logger.error(`Error eliminando grado académico ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtener grados académicos por el nombre
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getDegreesByName = async (req, res) => {
    try {
        const degree = req.matchedData;
        const result = await degreeService.findByName(degree.degree);
        createResponse(res, 200, result);
    } catch (error) {
        logger.error(`Error obteniendo grados académicos por nombre ${req.params.name}`, { error });
        errorHandler(error, res);
    }
}

module.exports = {
    getDegrees,
    getDegree,
    createDegree,
    updateDegree,
    deleteDegree,
    getDegreesByName
};