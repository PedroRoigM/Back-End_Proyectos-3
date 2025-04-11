const { validateMongoId, validateIsActive } = require('./base');
const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateYearFields = [
    check("year")
        .optional()
        .isString().withMessage('El año debe ser una cadena de texto')
        .matches(/^\d{2}\/\d{2}$/).withMessage('El año debe tener el formato XX/XX'),
    check("startDate")
        .optional()
        .isDate().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && req.body.endDate && new Date(value) >= new Date(req.body.endDate)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    check("endDate")
        .optional()
        .isDate().withMessage('La fecha de fin debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
            return true;
        }),
    check("active")
        .optional()
        .isBoolean().withMessage('El estado activo debe ser un valor booleano')
        .isIn([true, false]).withMessage('El estado activo debe ser verdadero o falso'),
    (req, res, next) => validateResults(req, res, next)
];
const validateSearchYear = [
    check("year")
        .optional()
        .isString().withMessage('El año debe ser una cadena de texto')
        .matches(/^\d{2}\/\d{2}$/).withMessage('El año debe tener el formato XX/XX'),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo: validateMongoId(),
    validateYearFields,
    validateSearchYear,
    validateIsActive: validateIsActive,
};
