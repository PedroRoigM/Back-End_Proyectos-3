const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateMongoId = (paramName = 'id') => [
    check(paramName)
        .isMongoId().withMessage(`El ${paramName} proporcionado no es válido`),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateMongoId
};
