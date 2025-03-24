/**
 * Servicio para la gestión de tutores/asesores
 * @module services/advisor.service
 */
const { advisorsModel, tfgsModel } = require('../models');

/**
 * Obtiene todos los tutores/asesores
 * @async
 * @returns {Promise<Array>} Lista de tutores
 */
const getAllAdvisors = async () => {
    return await advisorsModel.find().select("_id advisor email department specialties active");
};

/**
 * Busca un tutor por su nombre
 * @async
 * @param {string} name - Nombre del tutor
 * @returns {Promise<Object|null>} Tutor encontrado o null
 */
const findAdvisorByName = async (name) => {
    return await advisorsModel.findOne({
        advisor: { $regex: new RegExp('^' + name + '$', 'i') }
    });
};

/**
 * Crea un nuevo tutor
 * @async
 * @param {Object} advisorData - Datos del tutor
 * @returns {Promise<Object>} Tutor creado
 */
const createAdvisor = async (advisorData) => {
    return await advisorsModel.create(advisorData);
};

/**
 * Verifica si un tutor está siendo usado en TFGs
 * @async
 * @param {string} advisorId - ID del tutor
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isAdvisorUsedInTFGs = async (advisorId) => {
    const advisor = await advisorsModel.findById(advisorId);
    if (!advisor) return false;

    const tfgsCount = await tfgsModel.countDocuments({ advisor: advisor.advisor });
    return tfgsCount > 0;
};

/**
 * Elimina un tutor
 * @async
 * @param {string} id - ID del tutor
 * @returns {Promise<Object>} Tutor eliminado
 */
const deleteAdvisor = async (id) => {
    return await advisorsModel.findByIdAndDelete(id);
};

module.exports = {
    getAllAdvisors,
    findAdvisorByName,
    createAdvisor,
    isAdvisorUsedInTFGs,
    deleteAdvisor
};