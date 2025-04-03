/**
 * Servicio para la gestión de años académicos
 * @module services/year.service
 */
const { yearsModel, tfgsModel } = require('../models');
const logger = require('../utils/logger');

/**
 * Obtiene todos los años académicos
 * @async
 * @param {boolean} onlyActive - Si es true, solo devuelve años activos
 * @returns {Promise<Array>} Lista de años
 */
const getAllYears = async (onlyActive = false) => {
    try {
        const query = onlyActive ? { active: true } : {};
        return await yearsModel.find(query).select("_id year startDate endDate active");
    } catch (error) {
        logger.error('Error obteniendo años académicos', { error, onlyActive });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Busca un año por su nombre
 * @async
 * @param {string} yearName - Nombre del año (formato XX/XX)
 * @returns {Promise<Object|null>} Año encontrado o null
 */
const findYearByName = async (yearName) => {
    try {
        return await yearsModel.findOne({ year: yearName });
    } catch (error) {
        logger.error(`Error buscando año por nombre: ${yearName}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un año por su ID
 * @async
 * @param {string} id - ID del año
 * @returns {Promise<Object|null>} Año encontrado o null
 */
const getYearById = async (id) => {
    try {
        const year = await yearsModel.findById(id);

        if (!year) {
            throw new Error('YEAR_NOT_FOUND');
        }

        return year;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'YEAR_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de año inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo año por ID: ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Crea un nuevo año académico
 * @async
 * @returns {Promise<Object>} Año creado
 */
const createYear = async () => {
    try {
        // Generar los datos del año académico actual
        const yearData = await getCurrentYear();

        // Registrar los datos para depuración
        logger.info('Intentando crear año académico con datos:', yearData);

        // Verificar si ya existe un año con ese nombre
        const existingYear = await findYearByName(yearData.year);
        if (existingYear) {
            throw new Error('YEAR_ALREADY_EXISTS');
        }

        // Asegurarse de que los campos cumplen con el esquema
        // Aquí solo incluimos los campos que sabemos que están en el modelo
        const validYearData = {
            year: yearData.year,
            startDate: yearData.startDate,
            endDate: yearData.endDate,
            active: yearData.active || true
        };

        // Crear el nuevo año académico con los datos validados
        return await yearsModel.create(validYearData);
    } catch (error) {
        // Registrar el error completo para depuración
        logger.error('Error detallado al crear año académico', {
            error: error.message,
            stack: error.stack,
            name: error.name,
            details: error.details || (error.errors ? Object.keys(error.errors).map(key => {
                return { field: key, message: error.errors[key].message };
            }) : undefined)
        });

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            throw validationError;
        }

        // Verificar si es un error específico que ya hemos lanzado
        if (error.message === 'YEAR_ALREADY_EXISTS') {
            throw error;
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            throw new Error('YEAR_ALREADY_EXISTS');
        }

        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza un año académico existente
 * @async
 * @param {string} id - ID del año
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object|null>} Año actualizado o null si no existe
 */
const updateYear = async (id, updateData) => {
    try {
        const year = await yearsModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!year) {
            throw new Error('YEAR_NOT_FOUND');
        }

        return year;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'YEAR_NOT_FOUND') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al actualizar año ${id}`, { error, validationError, updateData });
            throw validationError;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de año inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error(`Año académico duplicado al actualizar ${id}`, { error, updateData });
            throw new Error('YEAR_ALREADY_EXISTS');
        }

        logger.error(`Error actualizando año académico ${id}`, { error, updateData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Verifica si un año está siendo usado en TFGs
 * @async
 * @param {string} yearId - ID del año
 * @returns {Promise<boolean>} true si está en uso, false en caso contrario
 */
const isYearUsedInTFGs = async (yearId) => {
    try {
        const year = await yearsModel.findById(yearId);
        if (!year) {
            return false;
        }

        const tfgsCount = await tfgsModel.countDocuments({ year: year.year });
        return tfgsCount > 0;
    } catch (error) {
        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de año inválido: ${yearId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error verificando uso de año ${yearId} en TFGs`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Elimina un año académico
 * @async
 * @param {string} id - ID del año
 * @returns {Promise<Object>} Año eliminado
 */
const deleteYear = async (id) => {
    try {
        const year = await yearsModel.findByIdAndDelete(id);

        if (!year) {
            throw new Error('YEAR_NOT_FOUND');
        }

        return year;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'YEAR_NOT_FOUND') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de año inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando año académico ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene el año académico actual
 * @async
 * @returns {Promise<Object>} Año actual
 */
const getCurrentYear = async () => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // Meses en JavaScript van de 0 a 11

        // Determinar el formato del año académico (XX/XX)
        let yearStr;
        if (currentMonth >= 9) { // Si es septiembre o después, es el inicio de un nuevo curso
            const startYear = currentYear.toString().slice(-2);
            const endYear = (currentYear + 1).toString().slice(-2);
            yearStr = `${startYear}/${endYear}`;
        } else {
            const startYear = (currentYear - 1).toString().slice(-2);
            const endYear = currentYear.toString().slice(-2);
            yearStr = `${startYear}/${endYear}`;
        }

        // Formato de fechas corregido (para asegurar compatibilidad)
        const startDate = currentMonth >= 9
            ? new Date(`${currentYear}-09-01T00:00:00.000Z`)
            : new Date(`${currentYear - 1}-09-01T00:00:00.000Z`);

        const endDate = currentMonth >= 9
            ? new Date(`${currentYear + 1}-08-31T23:59:59.999Z`)
            : new Date(`${currentYear}-08-31T23:59:59.999Z`);

        return {
            year: yearStr,
            startDate: startDate,
            endDate: endDate,
            active: true
        };
    } catch (error) {
        logger.error('Error obteniendo año académico actual', { error });
        throw new Error('DEFAULT_ERROR');
    }
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