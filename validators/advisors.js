const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { isValidUtadEmail } = require('../utils/handleEmailValidator');

/**
 * Middleware personalizado para validar el formato de correo U-tad
 */
const validateUtadEmail = (value) => {
    if (!isValidUtadEmail(value)) {
        throw new Error('El email debe tener el formato nombre.apellido@u-tad.com o nombre.apellido@live.u-tad.com. También se acepta nombre.apellidoNumero.');
    }
    return true;
};

const validateIdMongo = [
    check('id')
        .isMongoId().withMessage('ID_MONGO_INVALID'),
    (req, res, next) => validateResults(req, res, next)
];

const validateCreateAdvisor = [
    check('advisor')
        .isString().withMessage('FULLNAME_MUST_BE_STRING')
        .notEmpty().withMessage('FULLNAME_CANNOT_BE_EMPTY')
        .isLength({ min: 3, max: 100 }).withMessage('FULLNAME_LENGTH_INVALID'),
    check('email')
        .optional()
        .isEmail().withMessage('EMAIL_FORMAT_INVALID')
        .custom(validateUtadEmail),
    check('department')
        .optional()
        .isString().withMessage('DEPARTMENT_MUST_BE_STRING'),
    check('specialties')
        .optional()
        .isArray().withMessage('SPECIALTIES_MUST_BE_ARRAY'),
    check('active')
        .optional()
        .isBoolean().withMessage('ACTIVE_MUST_BE_BOOLEAN'),
    (req, res, next) => validateResults(req, res, next)
];

const validateUpdateAdvisor = [
    check('advisor')
        .optional()
        .isString().withMessage('FULLNAME_MUST_BE_STRING')
        .notEmpty().withMessage('FULLNAME_CANNOT_BE_EMPTY')
        .isLength({ min: 3, max: 100 }).withMessage('FULLNAME_LENGTH_INVALID'),
    check('email')
        .optional()
        .isEmail().withMessage('EMAIL_FORMAT_INVALID')
        .custom(validateUtadEmail),
    check('department')
        .optional()
        .isString().withMessage('DEPARTMENT_MUST_BE_STRING'),
    check('specialties')
        .optional()
        .isArray().withMessage('SPECIALTIES_MUST_BE_ARRAY'),
    check('active')
        .optional()
        .isBoolean().withMessage('ACTIVE_MUST_BE_BOOLEAN'),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo,
    validateCreateAdvisor,
    validateUpdateAdvisor
};