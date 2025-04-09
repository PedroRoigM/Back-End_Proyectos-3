/**
 * Servicio para la gestión de grados académicos
 * @module services/degree.service
 */
const { degreesModel } = require('../models');
const logger = require('../utils/logger');
const BaseService = require('./base.service');
class DegreeService extends BaseService {
    constructor() {
        super(degreesModel, 'degree');
    }
}
module.exports = new DegreeService();