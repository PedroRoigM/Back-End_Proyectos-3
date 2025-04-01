/**
 * Servicio para la gestión de grados académicos
 * @module services/degree.service
 */
const { degreesModel, tfgsModel } = require('../models');
const logger = require('../utils/logger');

/**
 * Obtiene todos los grados académicos
 * @async
 * @param {boolean} onlyActive - Si es true, solo devuelve grados activos
 * @returns {Promise<Array>} Lista de grados
 */
const getAllDegrees = async (onlyActive = false) => {
    try {
        const query = onlyActive ? { active: true } : {};
        return await degreesModel.find(query).select("_id degree abbreviation faculty active");
    } catch (error) {
        logger.error('Error obteniendo grados académicos', { error, onlyActive });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Busca un grado por su nombre
 * @async
 * @param {string} name - Nombre del grado
 * @returns {Promise<Object|null>} Grado encontrado o null
 */
const findDegreeByName = async (name) => {
    try {
        return await degreesModel.findOne({
            degree: { $regex: new RegExp('^' + name + '$', 'i') }
        });
    } catch (error) {
        logger.error(`Error buscando grado por nombre: ${name}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un grado por su ID
 * @async
 * @param {string} id - ID del grado
 * @returns {Promise<Object|null>} Grado encontrado o null
 */
const getDegreeById = async (id) => {
    try {
        const degree = await degreesModel.findById(id);

        if (!degree) {
            throw new Error('DEGREE_NOT_FOUND');
        }

        return degree;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'DEGREE_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de grado inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo grado por ID: ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Crea un nuevo grado académico
 * @async
 * @param {Object} degreeData - Datos del grado
 * @returns {Promise<Object>} Grado creado
 */
const createDegree = async (degreeData) => {
    try {
        return await degreesModel.create(degreeData);
    } catch (error) {
        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error('Error de validación al crear grado', { error, validationError });
            throw validationError;
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error('Grado duplicado', { error, degreeData });
            throw new Error('DEGREE_ALREADY_EXISTS');
        }

        logger.error('Error creando grado académico', { error, degreeData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza un grado académico existente
 * @async
 * @param {string} id - ID del grado
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object|null>} Grado actualizado o null si no existe
 */
const updateDegree = async (id, updateData) => {
    try {
        const degree = await degreesModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!degree) {
            throw new Error('DEGREE_NOT_FOUND');
        }

        return degree;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'DEGREE_NOT_FOUND') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al actualizar grado ${id}`, { error, validationError, updateData });
            throw validationError;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de grado inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error(`Grado duplicado al actualizar ${id}`, { error, updateData });
            throw new Error('DEGREE_ALREADY_EXISTS');
        }

        logger.error(`Error actualizando grado académico ${id}`, { error, updateData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Verifica si un grado está siendo usado en TFGs
 * @async
 * @param {string} degreeId - ID del grado
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isDegreeUsedInTFGs = async (degreeId) => {
    try {
        const degree = await degreesModel.findById(degreeId);
        if (!degree) {
            return false;
        }

        const tfgsCount = await tfgsModel.countDocuments({ degree: degree.degree });
        return tfgsCount > 0;
    } catch (error) {
        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de grado inválido: ${degreeId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error verificando uso de grado ${degreeId} en TFGs`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Elimina un grado académico
 * @async
 * @param {string} id - ID del grado
 * @returns {Promise<Object>} Grado eliminado
 */
const deleteDegree = async (id) => {
    try {
        const degree = await degreesModel.findByIdAndDelete(id);

        if (!degree) {
            throw new Error('DEGREE_NOT_FOUND');
        }

        return degree;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'DEGREE_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de grado inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando grado académico ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

module.exports = {
    getAllDegrees,
    findDegreeByName,
    getDegreeById,
    createDegree,
    updateDegree,
    isDegreeUsedInTFGs,
    deleteDegree
};