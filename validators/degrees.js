const { check, validationResult } = require("express-validator");

const validateIdMongo = [
    check("id").isMongoId().withMessage("El ID proporcionado no es válido"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

const validateDegree = [
    check("degree")
        .isString()
        .withMessage("El campo 'degree' debe ser un string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

module.exports = { validateIdMongo, validateDegree };