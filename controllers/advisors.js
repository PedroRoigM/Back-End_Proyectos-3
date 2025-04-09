/**
 * Controlador de tutores/asesores
 * @module controllers/advisors
 */
const advisorService = require('../services/advisor.service');
const { createResponse, errorHandler } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Obtiene todos los tutores
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAdvisors = async (req, res) => {
    try {
        const advisors = await advisorService.getAll();
        createResponse(res, 200, advisors);
    } catch (error) {
        logger.error('Error obteniendo tutores', { error });
        errorHandler(error, res);
    }
};

/**
 * Crea un nuevo tutor
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const createAdvisor = async (req, res) => {
    try {
        const advisorData = req.matchedData;
        if (!advisorData || !advisorData.advisor) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const createdAdvisor = await advisorService.create(advisorData);
        createResponse(res, 201, createdAdvisor);
    } catch (error) {
        logger.error('Error creando tutor', { error, advisorData: req.matchedData });
        errorHandler(error, res);
    }
};

/**
 * Actualiza un tutor existente
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateAdvisor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.matchedData;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const updatedAdvisor = await advisorService.update(id, updateData);
        createResponse(res, 200, updatedAdvisor);
    } catch (error) {
        logger.error(`Error actualizando tutor ${req.params.id}`, { error, updateData: req.matchedData });
        errorHandler(error, res);
    }
};

/**
 * Elimina un tutor
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const deleteAdvisor = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await advisorService.delete(id);
        createResponse(res, 200, response);
    } catch (error) {
        logger.error(`Error eliminando tutor ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un tutor por su ID
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAdvisor = async (req, res) => {
    try {
        const { id } = req.params;
        const advisor = await advisorService.getById(id);
        createResponse(res, 200, advisor);
    } catch (error) {
        logger.error(`Error obteniendo tutor ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un tutor por su Nombre
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAdvisorsByName = async (req, res) => {
    try {
        const advisor = req.matchedData;
        const result = await advisorService.findByName(advisor.advisor);
        createResponse(res, 200, result);
    } catch (error) {
        logger.error(`Error obteniendo tutor por nombre ${req.params.name}`, { error });
        errorHandler(error, res);
    }
};
module.exports = {
    getAdvisors,
    getAdvisor,
    createAdvisor,
    updateAdvisor,
    deleteAdvisor,
    getAdvisorsByName
};