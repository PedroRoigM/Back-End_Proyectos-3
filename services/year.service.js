/**
 * Servicio para la gestión de años académicos
 * @module services/year.service
 */
const { yearsModel, tfgsModel } = require('../models');

/**
 * Obtiene todos los años académicos
 * @async
 * @param {boolean} onlyActive - Si es true, solo devuelve años activos
 * @returns {Promise<Array>} Lista de años
 */
const getAllYears = async (onlyActive = false) => {
    const query = onlyActive ? { active: true } : {};
    return await yearsModel.find(query).select("_id year startDate endDate active");
};

/**
 * Busca un año por su nombre
 * @async
 * @param {string} yearName - Nombre del año (formato XX/XX)
 * @returns {Promise<Object|null>} Año encontrado o null
 */
const findYearByName = async (yearName) => {
    return await yearsModel.findOne({ year: yearName });
};

/**
 * Obtiene un año por su ID
 * @async
 * @param {string} id - ID del año
 * @returns {Promise<Object|null>} Año encontrado o null
 */
const getYearById = async (id) => {
    return await yearsModel.findById(id);
};

/**
 * Crea un nuevo año académico
 * @async
 * @param {Object} yearData - Datos del año
 * @returns {Promise<Object>} Año creado
 */
const createYear = async (yearData) => {
    return await yearsModel.create(yearData);
};

/**
 * Actualiza un año académico existente
 * @async
 * @param {string} id - ID del año
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object|null>} Año actualizado o null si no existe
 */
const updateYear = async (id, updateData) => {
    return await yearsModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );
};

/**
 * Verifica si un año está siendo usado en TFGs
 * @async
 * @param {string} yearId - ID del año
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isYearUsedInTFGs = async (yearId) => {
    const year = await yearsModel.findById(yearId);
    if (!year) return false;

    const tfgsCount = await tfgsModel.countDocuments({ year: year.year });
    return tfgsCount > 0;
};

/**
 * Elimina un año académico
 * @async
 * @param {string} id - ID del año
 * @returns {Promise<Object>} Año eliminado
 */
const deleteYear = async (id) => {
    return await yearsModel.findByIdAndDelete(id);
};

/**
 * Obtiene el año académico actual
 * @async
 * @returns {Promise<Object|null>} Año actual o null
 */
const getCurrentYear = async () => {
    const now = new Date();
    return await yearsModel.findOne({
        startDate: { $lte: now },
        endDate: { $gte: now }
    });
};

module.exports = {
    getAllYears,
    findYearByName,
    getYearById,
    createYear,
    updateYear,
    isYearUsedInTFGs,
    deleteYear,
    getCurrentYear
};