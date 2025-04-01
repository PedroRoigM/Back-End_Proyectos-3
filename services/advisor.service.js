/**
 * Servicio para la gestión de tutores/asesores
 * @module services/advisor.service
 */
const { advisorsModel, tfgsModel } = require('../models');
const logger = require('../utils/logger');

/**
 * Obtiene todos los tutores/asesores
 * @async
 * @returns {Promise<Array>} Lista de tutores
 */
const getAllAdvisors = async () => {
    try {
        return await advisorsModel.find().select("_id advisor email department specialties active");
    } catch (error) {
        logger.error('Error obteniendo todos los tutores', { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Busca un tutor por su nombre
 * @async
 * @param {string} name - Nombre del tutor
 * @returns {Promise<Object|null>} Tutor encontrado o null
 */
const findAdvisorByName = async (name) => {
    try {
        return await advisorsModel.findOne({
            advisor: { $regex: new RegExp('^' + name + '$', 'i') }
        });
    } catch (error) {
        logger.error(`Error buscando tutor por nombre: ${name}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un tutor por su ID
 * @async
 * @param {string} id - ID del tutor
 * @returns {Promise<Object|null>} Tutor encontrado o null
 */
const getAdvisorById = async (id) => {
    try {
        const advisor = await advisorsModel.findById(id);

        if (!advisor) {
            throw new Error('ADVISOR_NOT_FOUND');
        }

        return advisor;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'ADVISOR_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de tutor inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo tutor por ID: ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Crea un nuevo tutor
 * @async
 * @param {Object} advisorData - Datos del tutor
 * @returns {Promise<Object>} Tutor creado
 */
const createAdvisor = async (advisorData) => {
    try {
        return await advisorsModel.create(advisorData);
    } catch (error) {
        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error('Error de validación al crear tutor', { error, validationError });
            throw validationError;
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error('Tutor duplicado', { error, advisorData });
            throw new Error('ADVISOR_ALREADY_EXISTS');
        }

        logger.error('Error creando tutor', { error, advisorData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza un tutor existente
 * @async
 * @param {string} id - ID del tutor
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object|null>} Tutor actualizado o null si no existe
 */
const updateAdvisor = async (id, updateData) => {
    try {
        const advisor = await advisorsModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!advisor) {
            throw new Error('ADVISOR_NOT_FOUND');
        }

        return advisor;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'ADVISOR_NOT_FOUND') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al actualizar tutor ${id}`, { error, validationError, updateData });
            throw validationError;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de tutor inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error(`Tutor duplicado al actualizar ${id}`, { error, updateData });
            throw new Error('ADVISOR_ALREADY_EXISTS');
        }

        logger.error(`Error actualizando tutor ${id}`, { error, updateData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Verifica si un tutor está siendo usado en TFGs
 * @async
 * @param {string} advisorId - ID del tutor
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isAdvisorUsedInTFGs = async (advisorId) => {
    try {
        const advisor = await advisorsModel.findById(advisorId);
        if (!advisor) {
            return false;
        }

        const tfgsCount = await tfgsModel.countDocuments({ advisor: advisor.advisor });
        return tfgsCount > 0;
    } catch (error) {
        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de tutor inválido: ${advisorId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error verificando uso de tutor ${advisorId} en TFGs`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Elimina un tutor
 * @async
 * @param {string} id - ID del tutor
 * @returns {Promise<Object>} Tutor eliminado
 */
const deleteAdvisor = async (id) => {
    try {
        const advisor = await advisorsModel.findByIdAndDelete(id);

        if (!advisor) {
            throw new Error('ADVISOR_NOT_FOUND');
        }

        return advisor;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'ADVISOR_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de tutor inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando tutor ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

module.exports = {
    getAllAdvisors,
    getAdvisorById,
    findAdvisorByName,
    createAdvisor,
    updateAdvisor,
    isAdvisorUsedInTFGs,
    deleteAdvisor
};