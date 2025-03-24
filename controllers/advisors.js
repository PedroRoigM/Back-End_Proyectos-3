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
        const advisors = await advisorService.getAllAdvisors();
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
        const advisorData = req.matchedData || req.body;

        // Verificar si ya existe un tutor con el mismo nombre
        const existingAdvisor = await advisorService.findAdvisorByName(advisorData.advisor);
        if (existingAdvisor) {
            return errorHandler(new Error('ADVISOR_ALREADY_EXISTS'), res);
        }

        const createdAdvisor = await advisorService.createAdvisor(advisorData);
        createResponse(res, 201, createdAdvisor);
    } catch (error) {
        logger.error('Error creando tutor', { error, advisorData: req.body });
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

        // Verificar si el tutor está asociado a TFGs
        const isUsed = await advisorService.isAdvisorUsedInTFGs(id);
        if (isUsed) {
            return errorHandler(new Error('ADVISOR_IN_USE'), res);
        }

        const deletedAdvisor = await advisorService.deleteAdvisor(id);
        createResponse(res, 200, deletedAdvisor);
    } catch (error) {
        logger.error(`Error eliminando tutor ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

module.exports = {
    getAdvisors,
    createAdvisor,
    deleteAdvisor
};