const { advisorsModel, tfgsModel } = require('../models');
const BaseService = require('./base.service');
const logger = require('../utils/logger');

class AdvisorService extends BaseService {
    constructor() {
        super(advisorsModel, 'advisor');
    }
}

module.exports = new AdvisorService();