const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");
const { isValidUtadEmail } = require("../utils/handleEmailValidator");

/**
 * Middleware personalizado para validar el formato de correo U-tad
 */
const validateUtadEmail = (value) => {
    if (!isValidUtadEmail(value)) {
        throw new Error('El email debe tener el formato nombre.apellido@u-tad.com o nombre.apellido@live.u-tad.com. También se acepta nombre.apellidoNumero.');
    }
    return true;
};

const validatorRegister = [
    check("name").exists().notEmpty().isLength({ min: 3, max: 99 }).withMessage('El nombre debe tener entre 3 y 99 caracteres'),
    check("email")
        .exists().withMessage('El email es obligatorio')
        .notEmpty().withMessage('El email no puede estar vacío')
        .isEmail().withMessage('Formato de email inválido')
        .custom(validateUtadEmail),
    check("password")
        .exists().withMessage('La contraseña es obligatoria')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 8, max: 16 }).withMessage('La contraseña debe tener entre 8 y 16 caracteres'),
    (req, res, next) => {
        validateResults(req, res, next)
    }
];

const validatorLogin = [
    check("email")
        .exists().withMessage('El email es obligatorio')
        .notEmpty().withMessage('El email no puede estar vacío')
        .isEmail().withMessage('Formato de email inválido')
        .custom(validateUtadEmail),
    check("password")
        .exists().withMessage('La contraseña es obligatoria')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 8, max: 16 }).withMessage('La contraseña debe tener entre 8 y 16 caracteres'),
    (req, res, next) => {
        validateResults(req, res, next)
    }
];

const validatorGetUser = [
    check("id")
        .exists().withMessage('El ID es obligatorio')
        .notEmpty().withMessage('El ID no puede estar vacío')
        .isMongoId().withMessage('El ID debe ser un MongoDB ID válido'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdateUser = [
    check('name')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ min: 3, max: 99 }).withMessage('El nombre debe tener entre 3 y 99 caracteres'),
    check('email')
        .optional()
        .isEmail().withMessage('Formato de email inválido')
        .custom(validateUtadEmail),
    check('password')
        .optional()
        .isLength({ min: 8, max: 16 }).withMessage('La contraseña debe tener entre 8 y 16 caracteres'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorUpdateRole = [
    check('role')
        .exists().withMessage('El rol es obligatorio')
        .isIn(["administrador", "coordinador", "usuario"]).withMessage('El rol debe ser administrador, coordinador o usuario'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorValidateUser = [
    check('code')
        .exists().withMessage('El código es obligatorio')
        .isNumeric().withMessage('El código debe ser numérico')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorRequestRecoverPassword = [
    check('email')
        .exists().withMessage('El email es obligatorio')
        .isEmail().withMessage('Formato de email inválido')
        .custom(validateUtadEmail),
    (req, res, next) => validateResults(req, res, next)
];

const validatorRecoverPassword = [
    check('code')
        .exists().withMessage('El código es obligatorio')
        .isNumeric().withMessage('El código debe ser numérico')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
    check('email')
        .exists().withMessage('El email es obligatorio')
        .isEmail().withMessage('Formato de email inválido')
        .custom(validateUtadEmail),
    check('password')
        .exists().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8, max: 16 }).withMessage('La contraseña debe tener entre 8 y 16 caracteres'),
    (req, res, next) => validateResults(req, res, next)
];

const validatorSearchUsers = [
    check('email')
        .exists().withMessage('El email es obligatorio'),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validatorRegister,
    validatorLogin,
    validatorGetUser,
    validatorUpdateUser,
    validatorUpdateRole,
    validatorValidateUser,
    validatorRequestRecoverPassword,
    validatorRecoverPassword,
    validatorSearchUsers
};