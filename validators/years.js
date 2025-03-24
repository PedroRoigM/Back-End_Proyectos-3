const { check, validationResult } = require("express-validator");

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Middleware para validar un ID de MongoDB
const validateIdMongo = [
    check("id")
        .isMongoId().withMessage("El ID proporcionado no es válido"),
    (req, res, next) => validateResults(req, res, next)
];

// Middleware para validar el formato del año (XX/XX)
const validateYear = [
    check("year")
        .isString().withMessage("El campo 'year' debe ser una cadena de texto")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El formato de 'year' debe ser XX/XX")
        .custom((value) => {
            // Extraer los años y validar que sean consecutivos
            const [firstYear, secondYear] = value.split('/').map(Number);
            if (secondYear !== (firstYear + 1) % 100) { // Maneja el caso 99/00
                throw new Error("Los años deben ser consecutivos (ej: 22/23, 23/24)");
            }
            return true;
        }),
    check("active")
        .optional()
        .isBoolean().withMessage("El campo 'active' debe ser un valor booleano"),
    (req, res, next) => validateResults(req, res, next)
];

// Middleware para actualizar año académico
const validateUpdateYear = [
    check("year")
        .optional()
        .isString().withMessage("El campo 'year' debe ser una cadena de texto")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El formato de 'year' debe ser XX/XX")
        .custom((value) => {
            // Extraer los años y validar que sean consecutivos
            const [firstYear, secondYear] = value.split('/').map(Number);
            if (secondYear !== (firstYear + 1) % 100) { // Maneja el caso 99/00
                throw new Error("Los años deben ser consecutivos (ej: 22/23, 23/24)");
            }
            return true;
        }),
    check("active")
        .optional()
        .isBoolean().withMessage("El campo 'active' debe ser un valor booleano"),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo,
    validateYear,
    validateUpdateYear
};
