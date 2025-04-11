const { validateMongoId, validateIsActive } = require('./base');
const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const validateAdvisorFields = [
    check("advisor")
        .exists().withMessage('El nombre del tutor es obligatorio')
        .isString().withMessage('El nombre del tutor debe ser una cadena de texto')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del tutor debe tener entre 3 y 100 caracteres'),
    check("active")
        .optional()
        .isBoolean().withMessage('El estado activo debe ser un valor booleano')
        .isIn([true, false]).withMessage('El estado activo debe ser verdadero o falso'),
    (req, res, next) => validateResults(req, res, next)
];

const validateSearchAdvisor = [
    check("advisor")
        .exists().withMessage('El nombre del tutor es obligatorio')
        .isString().withMessage('El nombre del tutor debe ser una cadena de texto')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del tutor debe tener entre 3 y 100 caracteres'),
    (req, res, next) => validateResults(req, res, next)
];


module.exports = {
    validateIdMongo: validateMongoId(),
    validateAdvisorFields,
    validateSearchAdvisor,
    validateIsActive: validateIsActive,
};
