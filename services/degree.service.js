/**
 * Servicio para la gestión de grados académicos
 * @module services/degree.service
 */
const { degreesModel, tfgsModel } = require('../models');

/**
 * Obtiene todos los grados académicos
 * @async
 * @param {boolean} onlyActive - Si es true, solo devuelve grados activos
 * @returns {Promise<Array>} Lista de grados
 */
const getAllDegrees = async (onlyActive = false) => {
    const query = onlyActive ? { active: true } : {};
    return await degreesModel.find(query).select("_id degree abbreviation faculty active");
};

/**
 * Busca un grado por su nombre
 * @async
 * @param {string} name - Nombre del grado
 * @returns {Promise<Object|null>} Grado encontrado o null
 */
const findDegreeByName = async (name) => {
    return await degreesModel.findOne({
        degree: { $regex: new RegExp('^' + name + '$', 'i') }
    });
};

/**
 * Crea un nuevo grado académico
 * @async
 * @param {Object} degreeData - Datos del grado
 * @returns {Promise<Object>} Grado creado
 */
const createDegree = async (degreeData) => {
    return await degreesModel.create(degreeData);
};

/**
 * Verifica si un grado está siendo usado en TFGs
 * @async
 * @param {string} degreeId - ID del grado
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isDegreeUsedInTFGs = async (degreeId) => {
    const degree = await degreesModel.findById(degreeId);
    if (!degree) return false;

    const tfgsCount = await tfgsModel.countDocuments({ degree: degree.degree });
    return tfgsCount > 0;
};

/**
 * Elimina un grado académico
 * @async
 * @param {string} id - ID del grado
 * @returns {Promise<Object>} Grado eliminado
 */
const deleteDegree = async (id) => {
    return await degreesModel.findByIdAndDelete(id);
};

module.exports = {
    getAllDegrees,
    findDegreeByName,
    createDegree,
    isDegreeUsedInTFGs,
    deleteDegree
};