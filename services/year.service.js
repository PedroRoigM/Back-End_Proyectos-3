/**
 * Servicio para la gestión de años académicos
 * @module services/year.service
 */
const { yearsModel, tfgsModel } = require('../models');
const logger = require('../utils/logger');
const BaseService = require('./base.service');
class YearService extends BaseService {
    constructor() {
        super(yearsModel, 'year');
    }
    /**
     * Crear un nuevo año académico
     * @async
     * @returns {Promise<Object>} - El nuevo año académico creado
     */
    async createYear() {
        try {
            // Generar los datos del año académico actual
            const yearData = await this.getCurrentYear();
            ;
            // Verificar si ya existe un año con ese nombre
            const existingYear = await this.findByName(yearData.year);
            if (existingYear.leght > 0) {
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

            const reponse = await this.create(validYearData);
            return reponse;
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
     * Obtiene el año académico actual
     * @async
     * @returns {Promise<Object>} Año actual
     */
    async getCurrentYear() {
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
}
module.exports = new YearService();