const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validateIdMongo = [
    check("id")
        .isMongoId().withMessage("El ID proporcionado no es válido"),
    (req, res, next) => validateResults(req, res, next)
];

const validateDegree = [
    check("degree")
        .isString().withMessage("El campo 'degree' debe ser un string")
        .notEmpty().withMessage("El campo 'degree' no puede estar vacío")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre del grado debe tener entre 3 y 100 caracteres"),
    check("abbreviation")
        .optional()
        .isString().withMessage("El campo 'abbreviation' debe ser un string"),
    check("faculty")
        .optional()
        .isString().withMessage("El campo 'faculty' debe ser un string"),
    check("active")
        .optional()
        .isBoolean().withMessage("El campo 'active' debe ser un valor booleano"),
    (req, res, next) => validateResults(req, res, next)
];

const validateUpdateDegree = [
    check("degree")
        .optional()
        .isString().withMessage("El campo 'degree' debe ser un string")
        .notEmpty().withMessage("El campo 'degree' no puede estar vacío")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre del grado debe tener entre 3 y 100 caracteres"),
    check("abbreviation")
        .optional()
        .isString().withMessage("El campo 'abbreviation' debe ser un string"),
    check("faculty")
        .optional()
        .isString().withMessage("El campo 'faculty' debe ser un string"),
    check("active")
        .optional()
        .isBoolean().withMessage("El campo 'active' debe ser un valor booleano"),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo,
    validateDegree,
    validateUpdateDegree
};