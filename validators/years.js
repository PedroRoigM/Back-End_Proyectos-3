const { check, validationResult } = require("express-validator");

// Middleware para validar un ID de MongoDB
const validateIdMongo = [
    check("id").isMongoId().withMessage("El ID proporcionado no es válido"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware para validar el formato del año (XX/XX)
const validateYear = [
    check("year")
        .matches(/^\d{2}\/\d{2}$/)
        .withMessage("El formato de 'year' debe ser XX/XX"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateIdMongo, validateYear };
