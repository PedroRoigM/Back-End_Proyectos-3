const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorRegister = [
    check("name").exists().notEmpty().isLength({ min: 3, max: 99 }),
    check("email").exists().notEmpty().isEmail(),
    check("password").exists().notEmpty().isLength({ min: 8, max: 16 }),
    (req, res, next) => {
        validateResults(req, res, next)
    }
]

const validatorLogin = [
    check("email").exists().notEmpty().isEmail(),
    check("password").exists().notEmpty().isLength({ min: 8, max: 16 }),
    (req, res, next) => {
        validateResults(req, res, next)
    }
]

const validatorGetUser = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next)
]

const validatorUpdateUser = [
    check('name')
        .optional()
        .isString().withMessage('Name must be a string'),
    check('email')
        .optional()
        .isEmail().withMessage('Email must be valid'),
    check('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('role')
        .optional()
        .isIn(["administrador", "coordinador", "usuario"]).withMessage('Role must be either alumno, profesor, tutor or administrador'),
    (req, res, next) => validateResults(req, res, next)
]

const validatorValidateUser = [
    check('code')
        .exists()
        .isNumeric()
        .isLength({ min: 6, max: 6 }),
    (req, res, next) => validateResults(req, res, next)
]

module.exports = {
    validatorRegister,
    validatorLogin,
    validatorGetUser,
    validatorUpdateUser,
    validatorValidateUser
};