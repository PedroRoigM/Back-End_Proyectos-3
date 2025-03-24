const { check, validationResult } = require("express-validator");

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

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
    check("shortName")
        .optional()
        .isString().withMessage("El campo 'shortName' debe ser un string"),
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
    check("shortName")
        .optional()
        .isString().withMessage("El campo 'shortName' debe ser un string"),
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
