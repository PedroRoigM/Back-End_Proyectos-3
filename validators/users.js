const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateUser = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('role')
        .optional()
        .isIn(["administrador", "coordinador", "usuario"]).withMessage('Role must be either alumno, profesor, tutor or administrador'),
    (req, res, next) => validateResults(req, res, next)
]

const validatorGetUser = [
    check("id").exists().notEmpty().isMongoId(),
        (req, res, next) => validateResults(req, res, next)
]

const validatorUpdateUser =  [
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

module.exports = {
    validatorCreateUser,
    validatorGetUser,
    validatorUpdateUser
};