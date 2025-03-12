const { check, validationResult } = require('express-validator');

const validateIdMongo = check('id').isMongoId().withMessage('ID_MONGO_INVALID');
const validateCreateAdvisor = [
    check('advisor').isString().withMessage('FULLNAME_MUST_BE_STRING'),
];

module.exports = {
    validateIdMongo,
    validateCreateAdvisor,
};