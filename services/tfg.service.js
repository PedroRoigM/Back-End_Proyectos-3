/**
 * Servicio para la gestión de TFGs
 * @module services/tfg.service
 */
const { tfgsModel, yearsModel, degreesModel } = require('../models');
const logger = require('../utils/logger');

/**
 * Obtiene lista resumida de nombres de TFGs
 * @async
 * @returns {Promise<Array>} Lista con IDs y títulos de TFGs
 */
const getTFGNames = async () => {
    try {
        return await tfgsModel.find({ verified: true }).select("_id tfgTitle");
    } catch (error) {
        logger.error('Error obteniendo nombres de TFGs', { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene todos los TFGs
 * @async
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de TFGs
 */
const getAllTFGs = async (filters = {}) => {
    try {
        let query = {};

        // Aplicar filtros si existen
        if (filters.year) query.year = filters.year;
        if (filters.degree) query.degree = filters.degree;
        if (filters.verified !== undefined) query.verified = filters.verified;

        return await tfgsModel.find(query);
    } catch (error) {
        logger.error('Error obteniendo TFGs', { error, filters });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un TFG por su ID
 * @async
 * @param {string} id - ID del TFG
 * @param {boolean} verified - Si se requiere verificación
 * @returns {Promise<Object>} TFG encontrado
 * @throws {Error} Si el TFG no existe o no está verificado
 */
const getTFGById = async (id, verified) => {
    try {
        const tfg = await tfgsModel.findById(id).select('year degree student tfgTitle keywords advisor abstract verified');

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        if (!tfg.verified && !verified) {
            throw new Error('TFG_NOT_VERIFIED');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS' || error.message === 'TFG_NOT_VERIFIED') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo TFG: ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene TFGs paginados con filtros
 * @async
 * @param {Object} filters - Filtros para la búsqueda
 * @param {number} page - Número de página
 * @param {number} pageSize - Tamaño de página
 * @returns {Promise<Object>} Resultado paginado
 */
const getPaginatedTFGs = async (filters = {}, page = 1, pageSize = 10) => {
    try {
        let query = {};

        // Filtros básicos
        if (filters.year) query.year = filters.year;
        if (filters.degree) query.degree = filters.degree;
        if (filters.advisor) query.advisor = filters.advisor;
        if (filters.verified !== undefined) query.verified = filters.verified;

        // Filtro de búsqueda
        if (filters.search) {
            const searchRegex = { $regex: filters.search, $options: "i" };
            query.$or = [
                { student: searchRegex },
                { tfgTitle: searchRegex },
                { keywords: { $in: filters.search.split(" ") } },
                { abstract: searchRegex }
            ];
        }

        const skip = (page - 1) * pageSize;

        // Consulta principal
        const [tfgs, totalTFGs] = await Promise.all([
            tfgsModel.find(query, 'year degree student tfgTitle keywords advisor abstract')
                .skip(skip)
                .limit(pageSize),
            tfgsModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalTFGs / pageSize);

        return {
            tfgs,
            totalPages,
            currentPage: page,
            totalTFGs
        };
    } catch (error) {
        logger.error('Error obteniendo TFGs paginados', { error, filters, page, pageSize });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Verifica que existan el año y el grado
 * @async
 * @param {string} year - Año académico
 * @param {string} degree - Grado académico
 * @throws {Error} Si el año o el grado no existen
 */
const validateYearAndDegree = async (year, degree) => {
    try {
        const [yearExists, degreeExists] = await Promise.all([
            yearsModel.findOne({ year }),
            degreesModel.findOne({ degree })
        ]);

        if (!yearExists) {
            throw new Error('YEAR_NOT_FOUND');
        }

        if (!degreeExists) {
            throw new Error('DEGREE_NOT_FOUND');
        }
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'YEAR_NOT_FOUND' || error.message === 'DEGREE_NOT_FOUND') {
            throw error;
        }

        logger.error('Error validando año y grado', { error, year, degree });
        throw new Error('VALIDATION_ERROR');
    }
};

/**
 * Crea un nuevo TFG
 * @async
 * @param {Object} tfgData - Datos del TFG
 * @returns {Promise<Object>} TFG creado
 */
const createTFG = async (tfgData) => {
    try {
        return await tfgsModel.create(tfgData);
    } catch (error) {
        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error('Error de validación al crear TFG', { error, validationError });
            throw validationError;
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error('TFG duplicado', { error, tfgData });
            throw new Error('TFG_ALREADY_EXISTS');
        }

        logger.error('Error creando TFG', { error, tfgData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza un TFG
 * @async
 * @param {string} id - ID del TFG
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} TFG actualizado
 */
const updateTFG = async (id, updateData) => {
    try {
        const tfg = await tfgsModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al actualizar TFG ${id}`, { error, validationError, updateData });
            throw validationError;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error actualizando TFG ${id}`, { error, updateData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza el archivo de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @param {string} fileUrl - URL del archivo
 * @returns {Promise<Object>} TFG actualizado
 */
const updateTFGFile = async (id, fileUrl) => {
    try {
        const tfg = await tfgsModel.findByIdAndUpdate(
            id,
            { $set: { link: fileUrl } },
            { new: true }
        );

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error actualizando archivo de TFG ${id}`, { error, fileUrl });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Verifica un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const verifyTFG = async (id) => {
    try {
        const tfg = await tfgsModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    verified: true
                }
            },
            { new: true }
        );

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error verificando TFG ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Elimina un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const deleteTFG = async (id) => {
    try {
        const result = await tfgsModel.delete({ _id: id });

        if (!result || result.deletedCount === 0) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return result;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando TFG ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Incrementa el contador de visualizaciones de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const incrementTFGViews = async (id) => {
    try {
        const tfg = await tfgsModel.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error incrementando visualizaciones de TFG ${id}`, { error });
        // Silenciamos este error para el usuario, ya que no es crítico
        // pero seguimos registrándolo en el log
        return null;
    }
};

/**
 * Incrementa el contador de descargas de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const incrementTFGDownloads = async (id) => {
    try {
        const tfg = await tfgsModel.findByIdAndUpdate(
            id,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!tfg) {
            throw new Error('TFG_NOT_EXISTS');
        }

        return tfg;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'TFG_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de TFG inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error incrementando descargas de TFG ${id}`, { error });
        // Silenciamos este error para el usuario, ya que no es crítico
        // pero seguimos registrándolo en el log
        return null;
    }
};

module.exports = {
    getTFGNames,
    getAllTFGs,
    getTFGById,
    getPaginatedTFGs,
    validateYearAndDegree,
    createTFG,
    updateTFG,
    updateTFGFile,
    verifyTFG,
    deleteTFG,
    incrementTFGViews,
    incrementTFGDownloads
};