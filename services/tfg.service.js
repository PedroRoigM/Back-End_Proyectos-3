/**
 * Servicio para la gestión de TFGs
 * @module services/tfg.service
 */
const { tfgsModel, yearsModel, degreesModel, advisorsModel } = require('../models');
const BaseService = require('./base.service');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Servicio para la gestión de TFGs
 * @extends BaseService
 */
class TfgService extends BaseService {
    /**
     * Crea una instancia del servicio de TFGs
     */
    constructor() {
        super(tfgsModel, 'tfg');
    }

    /**
     * Obtiene todos los TFGs
     * @async
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Lista de TFGs
     */
    async getAllTFGs(filters = {}) {
        try {
            const query = {};

            // Aplicar filtros si existen
            if (filters.year) {
                const year = await yearsModel.findOne({ year: filters.year });
                if (year) query.year = year._id;
            }

            if (filters.degree) {
                const degree = await degreesModel.findOne({ degree: filters.degree });
                if (degree) query.degree = degree._id;
            }

            if (filters.verified !== undefined) query.verified = filters.verified;

            return await this.model.find(query)
                .populate('year', 'year')
                .populate('degree', 'degree')
                .populate('advisor', 'advisor')
                .populate('verifiedBy', 'name');
        } catch (error) {
            this._handleError(error, 'getAllTFGs', null, filters);
        }
    }

    /**
     * Obtiene un TFG por su ID
     * @async
     * @param {string} id - ID del TFG
     * @param {boolean} allowUnverified - Si es true, permite obtener TFGs no verificados
     * @returns {Promise<Object>} TFG encontrado
     * @throws {Error} Si el TFG no existe o no está verificado
     */
    async getTFGById(id, allowUnverified = false) {
        try {
            const tfg = await this.model.findById(id, { $not: { link: undefined } })
                .populate({ path: 'year', select: 'year' })
                .populate({ path: 'degree', select: 'degree' })
                .populate({ path: 'advisor', select: 'advisor' })
                .populate({ path: 'verifiedBy', select: 'name' })
                .select('year degree student tfgTitle keywords advisor abstract verified');

            if (!tfg) {
                throw new Error(this.ERRORS.NOT_FOUND);
            }

            if (!tfg.verified && !allowUnverified) {
                throw new Error('TFG_NOT_VERIFIED');
            }

            return tfg;
        } catch (error) {
            if (error.message === 'TFG_NOT_VERIFIED') {
                throw error;
            }
            this._handleError(error, 'getTFGById', id);
        }
    }

    /**
     * Obtiene TFGs paginados con filtros
     * @async
     * @param {Object} filters - Filtros para la búsqueda
     * @param {number} page - Número de página
     * @param {number} pageSize - Tamaño de página
     * @returns {Promise<Object>} Resultado paginado
     */
    async getPaginatedTFGs(filters = {}, page = 1, pageSize = 10) {
        try {
            let query = {};

            // Filtros básicos - convertir strings a ObjectId para las referencias
            if (filters.year) {
                const year = await yearsModel.findOne({ year: filters.year });
                if (year) query.year = year._id;
            }

            if (filters.degree) {
                const degree = await degreesModel.findOne({ degree: filters.degree });
                if (degree) query.degree = degree._id;
            }

            if (filters.advisor) {
                const advisor = await advisorsModel.findOne({ advisor: filters.advisor });
                if (advisor) query.advisor = advisor._id;
            }

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
                this.model.find(query)
                    .populate('year', 'year')
                    .populate('degree', 'degree')
                    .populate('advisor', 'advisor')
                    .skip(skip)
                    .limit(pageSize)
                    .select('year degree student tfgTitle keywords advisor abstract'),
                this.model.countDocuments(query)
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
    }

    /**
     * Valida y obtiene referencias de año y grado
     * @async
     * @param {string} yearStr - Identificador de año (puede ser _id o string XX/XX)
     * @param {string} degreeStr - Identificador de grado (puede ser _id o nombre)
     * @returns {Promise<Object>} Objetos de año y grado
     * @throws {Error} Si el año o el grado no existen
     */
    async validateYearAndDegree(yearStr, degreeStr) {
        try {
            let yearQuery = {};
            let degreeQuery = {};

            // Determinar si yearStr es un ObjectId o una cadena de formato XX/XX
            if (mongoose.Types.ObjectId.isValid(yearStr)) {
                yearQuery = { _id: yearStr };
            } else {
                yearQuery = { year: yearStr };
            }

            // Determinar si degreeStr es un ObjectId o el nombre del grado
            if (mongoose.Types.ObjectId.isValid(degreeStr)) {
                degreeQuery = { _id: degreeStr };
            } else {
                degreeQuery = { degree: degreeStr };
            }

            const [yearDoc, degreeDoc] = await Promise.all([
                yearsModel.findOne(yearQuery),
                degreesModel.findOne(degreeQuery)
            ]);

            if (!yearDoc) {
                throw new Error('YEAR_NOT_FOUND');
            }

            if (!degreeDoc) {
                throw new Error('DEGREE_NOT_FOUND');
            }

            return {
                year: yearDoc._id,
                degree: degreeDoc._id,
                yearLabel: yearDoc.year,
                degreeLabel: degreeDoc.degree
            };
        } catch (error) {
            // Preservar errores específicos
            if (error.message === 'YEAR_NOT_FOUND' || error.message === 'DEGREE_NOT_FOUND') {
                throw error;
            }

            logger.error('Error validando año y grado', { error, yearStr, degreeStr });
            throw new Error('VALIDATION_ERROR');
        }
    }

    /**
     * Valida y obtiene referencia de asesor
     * @async
     * @param {string} advisorStr - Identificador de asesor (puede ser _id o nombre)
     * @returns {Promise<mongoose.Types.ObjectId>} ObjectId del asesor
     * @throws {Error} Si el asesor no existe
     */
    async validateAdvisor(advisorStr) {
        try {
            let advisorQuery = {};

            // Determinar si advisorStr es un ObjectId o el nombre del asesor
            if (mongoose.Types.ObjectId.isValid(advisorStr)) {
                advisorQuery = { _id: advisorStr };
            } else {
                advisorQuery = { advisor: advisorStr };
            }

            const advisorDoc = await advisorsModel.findOne(advisorQuery);

            if (!advisorDoc) {
                throw new Error('ADVISOR_NOT_FOUND');
            }

            return advisorDoc._id;
        } catch (error) {
            // Preservar errores específicos
            if (error.message === 'ADVISOR_NOT_FOUND') {
                throw error;
            }

            logger.error('Error validando asesor', { error, advisorStr });
            throw new Error('VALIDATION_ERROR');
        }
    }

    /**
     * Prepara datos del TFG para crear o actualizar, convirtiendo referencias
     * @async
     * @param {Object} tfgData - Datos del TFG con posibles valores string para referencias
     * @returns {Promise<Object>} Datos del TFG con referencias validadas como ObjectId
     */
    async prepareTFGData(tfgData) {
        try {
            const preparedData = { ...tfgData };

            // Validar y convertir año y grado
            if (tfgData.year && tfgData.degree) {
                const { year, degree } = await this.validateYearAndDegree(tfgData.year, tfgData.degree);
                preparedData.year = year;
                preparedData.degree = degree;
            }

            // Validar y convertir asesor
            if (tfgData.advisor) {
                preparedData.advisor = await this.validateAdvisor(tfgData.advisor);
            }

            // Procesar keywords si vienen como string
            if (typeof tfgData.keywords === 'string') {
                preparedData.keywords = tfgData.keywords.split(',').map(kw => kw.trim());
            }

            return preparedData;
        } catch (error) {
            logger.error('Error preparando datos del TFG', { error, tfgData });
            throw error; // Re-lanzar el error para que lo maneje el controlador
        }
    }

    /**
     * Verifica un TFG
     * @async
     * @param {string} id - ID del TFG
     * @param {string} userId - ID del usuario que verifica
     * @returns {Promise<Object>} TFG actualizado
     */
    async verifyTFG(id, userId = null) {
        const updateData = { verified: true };
        if (userId) {
            updateData.verifiedBy = userId;
        }
        return this.update(id, updateData);
    }

    /**
     * Incrementa el contador de visualizaciones de un TFG
     * @async
     * @param {string} id - ID del TFG
     * @returns {Promise<Object>} TFG actualizado
     */
    async incrementTFGViews(id) {
        try {
            const tfg = await this.model.findByIdAndUpdate(
                id,
                { $inc: { views: 1 } },
                { new: true }
            );

            if (!tfg) {
                throw new Error(this.ERRORS.NOT_FOUND);
            }

            return tfg;
        } catch (error) {
            // Para contadores no críticos, en caso de error simplemente lo registramos y no lo propagamos
            logger.error(`Error incrementando visualizaciones de TFG ${id}`, { error });
            return null;
        }
    }

    /**
     * Incrementa el contador de descargas de un TFG
     * @async
     * @param {string} id - ID del TFG
     * @returns {Promise<Object>} TFG actualizado
     */
    async incrementTFGDownloads(id) {
        try {
            const tfg = await this.model.findByIdAndUpdate(
                id,
                { $inc: { downloadCount: 1 } },
                { new: true }
            );

            if (!tfg) {
                throw new Error(this.ERRORS.NOT_FOUND);
            }

            return tfg;
        } catch (error) {
            // Para contadores no críticos, en caso de error simplemente lo registramos y no lo propagamos
            logger.error(`Error incrementando descargas de TFG ${id}`, { error });
            return null;
        }
    }

    /**
     * Obtener todos los tfgTitles
     * @async
     * @return {Promise<Array>} Lista de tfgTitles
     */
    async getAllTFGTitles() {
        try {
            const tfgTitles = await this.model.find({}, 'tfgTitle').exec();
            return tfgTitles.map(tfg => tfg.tfgTitle);
        } catch (error) {
            logger.error('Error obteniendo títulos de TFGs', { error });
            throw new Error('DEFAULT_ERROR');
        }
    }
}

// Exportar una instancia del servicio (patrón singleton)
module.exports = new TfgService();