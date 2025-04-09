const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { validateMongoId } = require('./base');

const validateCreateTFG = [
    // Validación para los campos específicos
    check("year", "El campo 'year' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'year' debe ser un ID de MongoDB válido."),
    check("degree", "El campo 'degree' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'degree' debe ser un ID de MongoDB válido."),
    check("student", "El campo 'student' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'student' debe ser una cadena de texto.")
        .trim(),
    check("tfgTitle", "El campo 'tfgTitle' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres")
        .trim(),
    check("keywords", "El campo 'keywords' es obligatorio").not().isEmpty()
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            if (value.length === 0) {
                throw new Error("Debe incluir al menos una palabra clave");
            }
            return true;
        }),
    check("advisor", "El campo 'advisor' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'advisor' debe ser un ID de MongoDB válido."),
    check("abstract", "El campo 'abstract' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres")
        .trim(),

    // Campos opcionales
    check("verified").optional()
        .isBoolean().withMessage("El campo 'verified' debe ser un valor booleano."),
    check("verifiedBy").optional()
        .isMongoId().withMessage("El campo 'verifiedBy' debe ser un ID de MongoDB válido."),
    check("reason").optional()
        .isString().withMessage("El campo 'reason' debe ser una cadena de texto."),
    check("createdBy").optional()
        .isMongoId().withMessage("El campo 'createdBy' debe ser un ID de MongoDB válido."),

    // Filtrar los campos no deseados, eliminando cualquier otro campo de `req.body`
    (req, res, next) => {
        const allowedFields = [
            'year', 'degree', 'student', 'tfgTitle', 'keywords', 'advisor',
            'abstract', 'verified', 'verifiedBy', 'reason', 'createdBy'
        ];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key]; // Eliminar los campos que no estén en la lista
            }
        });
        next();
    },

    // Función para validar los resultados de la solicitud
    (req, res, next) => validateResults(req, res, next)
];

// Validación para actualizar un TFG
const validatePutTFG = [
    // Validación para los campos obligatorios
    check("year", "El campo 'year' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'year' debe ser un ID de MongoDB válido."),
    check("degree", "El campo 'degree' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'degree' debe ser un ID de MongoDB válido."),
    check("student", "El campo 'student' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'student' debe ser una cadena de texto.")
        .trim(),
    check("tfgTitle", "El campo 'tfgTitle' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres")
        .trim(),
    check("keywords", "El campo 'keywords' es obligatorio").not().isEmpty()
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            if (value.length === 0) {
                throw new Error("Debe incluir al menos una palabra clave");
            }
            return true;
        }),
    check("advisor", "El campo 'advisor' es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'advisor' debe ser un ID de MongoDB válido."),
    check("abstract", "El campo 'abstract' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres")
        .trim(),

    // Campos opcionales
    check("verified").optional()
        .isBoolean().withMessage("El campo 'verified' debe ser un valor booleano."),
    check("verifiedBy").optional()
        .isMongoId().withMessage("El campo 'verifiedBy' debe ser un ID de MongoDB válido."),
    check("reason").optional()
        .isString().withMessage("El campo 'reason' debe ser una cadena de texto."),
    check("createdBy").optional()
        .isMongoId().withMessage("El campo 'createdBy' debe ser un ID de MongoDB válido."),

    // Filtrar los campos no deseados
    (req, res, next) => {
        const allowedFields = [
            'year', 'degree', 'student', 'tfgTitle', 'keywords', 'advisor',
            'abstract', 'verified', 'verifiedBy', 'reason', 'createdBy'
        ];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });
        next();
    },

    (req, res, next) => validateResults(req, res, next)
];

// Validación para actualizar parcialmente un TFG
const validatePatchTFG = [
    check("year").optional({ checkFalsy: true })
        .isMongoId().withMessage("El campo 'year' debe ser un ID de MongoDB válido."),
    check("degree").optional({ checkFalsy: true })
        .isMongoId().withMessage("El campo 'degree' debe ser un ID de MongoDB válido."),
    check("student").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'student' debe ser una cadena de texto.")
        .trim(),
    check("tfgTitle").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres")
        .trim(),
    check("keywords").optional({ checkFalsy: true })
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            if (value.length === 0) {
                throw new Error("Debe incluir al menos una palabra clave");
            }
            return true;
        }),
    check("advisor").optional({ checkFalsy: true })
        .isMongoId().withMessage("El campo 'advisor' debe ser un ID de MongoDB válido."),
    check("abstract").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres")
        .trim(),
    check("verified").optional({ checkFalsy: true })
        .isBoolean().withMessage("El campo 'verified' debe ser un valor booleano."),
    check("verifiedBy").optional({ checkFalsy: true })
        .isMongoId().withMessage("El campo 'verifiedBy' debe ser un ID de MongoDB válido."),
    check("reason").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'reason' debe ser una cadena de texto."),
    check("createdBy").optional({ checkFalsy: true })
        .isMongoId().withMessage("El campo 'createdBy' debe ser un ID de MongoDB válido."),

    (req, res, next) => validateResults(req, res, next)
];

const validateSearcher = [
    check("page_number").not().isEmpty().withMessage("El campo 'page_number' es obligatorio.")
        .isInt({ min: 1 }).withMessage("El campo 'page_number' debe ser un número entero mayor que 0."),
    check("year").optional()
        .isMongoId().withMessage("El campo 'year' debe ser un ID de MongoDB válido."),
    check("degree").optional()
        .isMongoId().withMessage("El campo 'degree' debe ser un ID de MongoDB válido."),
    check("advisor").optional()
        .isMongoId().withMessage("El campo 'advisor' debe ser un ID de MongoDB válido."),
    check("search").optional()
        .isString().withMessage("El campo 'search' debe ser una cadena de texto."),
    check("verified").optional()
        .isBoolean().withMessage("El campo 'verified' debe ser un valor booleano."),

    (req, res, next) => {
        const allowedFields = ['page_number', 'year', 'degree', 'advisor', 'search', 'verified'];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });
        next();
    },
    (req, res, next) => validateResults(req, res, next)
];

// Validador para verificar un TFG
const validateVerifyTFG = [
    check("reason").optional()
        .isString().withMessage("El campo 'reason' debe ser una cadena de texto."),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo: validateMongoId(),
    validateCreateTFG,
    validatePutTFG,
    validatePatchTFG,
    validateSearcher,
    validateVerifyTFG
};