const { advisorsModel } = require('../models');
const BaseService = require('./base.service');

class AdvisorService extends BaseService {
    constructor() {
        super(advisorsModel, 'advisor');
    }
}

module.exports = new AdvisorService();



