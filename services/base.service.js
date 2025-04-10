/**
 * Servicio base para operaciones CRUD comunes
 * @module services/base.service
 */
const logger = require('../utils/logger');
const { tfgsModel } = require('../models');

/**
 * Clase de servicio base que proporciona operaciones CRUD comunes
 */
class BaseService {
    /**
     * Crea una instancia del servicio base
     * @param {Object} model - Modelo de Mongoose
     * @param {string} entityName - Nombre de la entidad (advisor, degree, etc.)
     * @param {Object} options - Opciones adicionales
     */
    constructor(model, entityName, options = {}) {
        this.model = model;
        this.entityName = entityName;
        this.options = options;

        // Constantes de errores específicas para esta entidad
        this.ERRORS = {
            NOT_FOUND: `${entityName.toUpperCase()}_NOT_FOUND`,
            ALREADY_EXISTS: `${entityName.toUpperCase()}_ALREADY_EXISTS`,
            IN_USE: `${entityName.toUpperCase()}_IN_USE`
        };
    }

    /**
     * Maneja errores comunes en operaciones CRUD
     * @private
     * @param {Error} error - Error capturado
     * @param {string} operation - Operación que produjo el error (get, create, update, delete)
     * @param {string} [id] - ID de la entidad (si aplica)
     * @param {Object} [data] - Datos relacionados con la operación
     * @throws {Error} Error procesado
     */
    _handleError(error, operation, id = null, data = null) {
        // Preservar errores específicos ya procesados
        if ([
            this.ERRORS.NOT_FOUND,
            this.ERRORS.ALREADY_EXISTS,
            this.ERRORS.IN_USE,
            'VALIDATION_ERROR',
            'INVALID_ID'
        ].includes(error.message)) {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de ${this.entityName} inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al ${operation} ${this.entityName}${id ? ` ${id}` : ''}`,
                { error, validationError, data });
            throw validationError;
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error(`${this.entityName} duplicado${id ? ` al actualizar ${id}` : ''}`,
                { error, data });
            throw new Error(this.ERRORS.ALREADY_EXISTS);
        }

        // Error genérico
        logger.error(`Error ${operation} ${this.entityName}${id ? ` ${id}` : ''}`,
            { error, data });
        throw new Error('DEFAULT_ERROR');
    }

    /**
     * Obtiene todas las entidades
     * @async
     * @param {Object} [filter={}] - Filtros a aplicar en la consulta
     * @param {string} [select] - Campos a seleccionar
     * @returns {Promise<Array>} Lista de entidades
     */
    async getAll(filter = {}, select = '') {
        try {
            let query = this.model.find({ [this.entityName]: { $ne: null } }, filter).select(`${this.entityName} active`);
            if (select) {
                query = query.select(select);
            }

            return await query.exec();
        } catch (error) {
            this._handleError(error, 'getAll', null, filter);
        }
    }

    /**
     * Obtiene una entidad por su ID
     * @async
     * @param {string} id - ID de la entidad
     * @param {string} [select] - Campos a seleccionar
     * @returns {Promise<Object>} Entidad encontrada
     * @throws {Error} Si la entidad no existe
     */
    async getById(id, filters = {}, select = null) {
        try {
            let query = this.model.findById(id, filters).select(`${this.entityName} active`);

            if (select !== null) {
                query = query.select(select);
            }
            const entity = await query.exec();
            if (!entity) {
                throw new Error(this.ERRORS.NOT_FOUND);
            }

            return entity;
        } catch (error) {
            this._handleError(error, 'getById', id);
            throw error; // Relanzar el error para que getTFG pueda manejarlo
        }
    }
    /**
     * Busca una entidad por un campo específico
     * @async
     * @param {string} field - Campo para buscar
     * @param {any} value - Valor a buscar
     * @param {Object} [options={}] - Opciones adicionales (exact, caseInsensitive)
     * @returns {Promise<Object|null>} Entidad encontrada o null
     */
    async findByField(field, value, options = {}) {
        try {
            let query = {};

            if (options.exact || field === '_id') {
                query[field] = value;
            } else if (options.caseInsensitive) {
                query[field] = { $regex: new RegExp(`^${value}$`, 'i') };
            } else {
                query[field] = { $regex: value };
            }

            return await this.model.findOne(query).select(`${this.entityName} active`);
        } catch (error) {
            this._handleError(error, 'findByField', null, { field, value, options });
        }
    }

    /**
     * Crea una nueva entidad
     * @async
     * @param {Object} data - Datos de la entidad
     * @returns {Promise<Object>} Entidad creada
     */
    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            this._handleError(error, 'create', null, data);
        }
    }

    /**
     * Actualiza una entidad existente
     * @async
     * @param {string} id - ID de la entidad
     * @param {Object} data - Datos a actualizar
     * @param {Object} [options={}] - Opciones adicionales
     * @returns {Promise<Object>} Entidad actualizada
     * @throws {Error} Si la entidad no existe
     */
    async update(id, data, options = { runValidators: true }) {
        try {
            const entity = await this.model.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, ...options }
            );

            if (!entity) {
                throw new Error(this.ERRORS.NOT_FOUND);
            }

            return entity;
        } catch (error) {
            this._handleError(error, 'update', id, data);
        }
    }

    /**
     * Elimina una entidad
     * @async
     * @param {string} id - ID de la entidad
     * @returns {Promise<Object>} Entidad eliminada o resultado de la eliminación
     * @throws {Error} Si la entidad no existe o está siendo utilizada
     */
    async delete(id) {
        try {
            let isInUse = false;
            // Verificar si la entidad está siendo usada en algún TFG
            if (['advisor', 'degree', 'year'].includes(this.entityName)) {
                isInUse = await this.isUsedInTFGs(id);
                if (isInUse) {
                    throw new Error(this.ERRORS.IN_USE);
                }
            } else {
                throw new Error('INVALID_ENTITY_NAME');
            }
            if (!isInUse) {
                await this.model.findByIdAndDelete(id);
            }


            // Devolver un ACK
            return { message: `${this.entityName} eliminado` };
        } catch (error) {
            this._handleError(error, 'delete', id);
        }
    }

    /**
    * Verifica si una entidad está siendo usada en el modelo TFG
    * @async
    * @param {string} id - ID de la entidad
    * @returns {Promise<boolean>} true si está en uso, false en caso contrario
    */
    async isUsedInTFGs(id) {
        try {
            const entity = await this.getById(id);
            if (!entity) return false;

            // Construir la consulta para el modelo TFG
            const query = {};

            // Determinar el campo de búsqueda en TFGs según el tipo de entidad
            switch (this.entityName) {
                case 'advisor':
                    query.advisor = entity._id;
                    break;
                case 'degree':
                    query.degree = entity._id;
                    break;
                case 'year':
                    query.year = entity._id;
                    break;
                default:
                    // Si no es una entidad reconocida, buscar por el ID genérico
                    query[this.entityName] = entity._id;
            }

            const count = await this.tfgsModel.countDocuments(query);
            return count > 0;
        } catch (error) {
            if (error.message === this.ERRORS.NOT_FOUND || error.message === 'INVALID_ID') {
                return false;
            }
            this._handleError(error, 'isUsedInTFGs', id);
            return false;
        }
    }

    /**
     * Encontrar entidades por su nombre (year o advisor o degree)
     * @async
     * @param {string} name - Nombre de la entidad
     * @returns {Promise<Object|null>} Entidad encontrada o null
     */
    async findByName(name) {
        try {
            return await this.model.find({
                [this.entityName]: { $regex: new RegExp(name, 'i') }
            });
        } catch (error) {
            this._handleError(error, 'findByName', null, { name });
        }
    }
}

module.exports = BaseService;