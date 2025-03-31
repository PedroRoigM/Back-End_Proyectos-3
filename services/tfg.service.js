/**
 * Servicio para la gestión de TFGs
 * @module services/tfg.service
 */
const { tfgsModel, yearsModel, degreesModel } = require('../models');

/**
 * Obtiene lista resumida de nombres de TFGs
 * @async
 * @returns {Promise<Array>} Lista con IDs y títulos de TFGs
 */
const getTFGNames = async () => {
    return await tfgsModel.find({ verified: true }).select("_id tfgTitle");
};

/**
 * Obtiene todos los TFGs
 * @async
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de TFGs
 */
const getAllTFGs = async (filters = {}) => {
    let query = {};

    // Aplicar filtros si existen
    if (filters.year) query.year = filters.year;
    if (filters.degree) query.degree = filters.degree;
    if (filters.verified !== undefined) query.verified = filters.verified;

    return await tfgsModel.find(query);
};

/**
 * Obtiene un TFG por su ID
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG encontrado
 * @throws {Error} Si el TFG no existe o no está verificado
 */
const getTFGById = async (id, verified) => {
    const tfg = await tfgsModel.findById(id).select('year degree student tfgTitle keywords advisor abstract verified');

    if (!tfg) {
        const error = new Error('TFG_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    if (!tfg.verified && !verified) {
        const error = new Error('TFG_NOT_VERIFIED');
        error.status = 403;
        throw error;
    }

    return tfg;
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
};

/**
 * Verifica que existan el año y el grado
 * @async
 * @param {string} year - Año académico
 * @param {string} degree - Grado académico
 * @throws {Error} Si el año o el grado no existen
 */
const validateYearAndDegree = async (year, degree) => {
    const [yearExists, degreeExists] = await Promise.all([
        yearsModel.findOne({ year }),
        degreesModel.findOne({ degree })
    ]);

    if (!yearExists) {
        const error = new Error('El curso académico no es válido.');
        error.status = 400;
        throw error;
    }

    if (!degreeExists) {
        const error = new Error('La titulación no es válida.');
        error.status = 400;
        throw error;
    }
};

/**
 * Crea un nuevo TFG
 * @async
 * @param {Object} tfgData - Datos del TFG
 * @returns {Promise<Object>} TFG creado
 */
const createTFG = async (tfgData) => {
    return await tfgsModel.create(tfgData);
};

/**
 * Actualiza un TFG
 * @async
 * @param {string} id - ID del TFG
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} TFG actualizado
 */
const updateTFG = async (id, updateData) => {
    return await tfgsModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

/**
 * Actualiza el archivo de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @param {string} fileUrl - URL del archivo
 * @returns {Promise<Object>} TFG actualizado
 */
const updateTFGFile = async (id, fileUrl) => {
    return await tfgsModel.findByIdAndUpdate(
        id,
        { $set: { link: fileUrl } },
        { new: true }
    );
};

/**
 * Verifica un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const verifyTFG = async (id) => {
    return await tfgsModel.findByIdAndUpdate(
        id,
        {
            $set: {
                verified: true
            }
        },
        { new: true }
    );
};

/**
 * Elimina un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const deleteTFG = async (id) => {
    return await tfgsModel.delete({ _id: id });
};

/**
 * Incrementa el contador de visualizaciones de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const incrementTFGViews = async (id) => {
    return await tfgsModel.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
    );
};

/**
 * Incrementa el contador de descargas de un TFG
 * @async
 * @param {string} id - ID del TFG
 * @returns {Promise<Object>} TFG actualizado
 */
const incrementTFGDownloads = async (id) => {
    return await tfgsModel.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } },
        { new: true }
    );
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