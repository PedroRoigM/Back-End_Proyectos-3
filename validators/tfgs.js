const { check, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validación para el id de MongoDB
const validateIdMongo = [
    check("id", "El id es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'id' debe ser un ID de MongoDB válido."),
    (req, res, next) => validateResults(req, res, next)
];

const validateCreateTFG = [
    // Validación para los campos específicos
    check("year", "El campo 'year' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'year' debe ser una cadena de texto.")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El campo 'year' debe tener el formato 'XX/XX'."),
    check("degree", "El campo 'degree' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("student", "El campo 'student' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("tfgTitle", "El campo 'tfgTitle' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres"),
    check("keywords", "El campo 'keywords' es obligatorio").not().isEmpty()
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            return true;
        }),
    check("advisor", "El campo 'advisor' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("abstract", "El campo 'abstract' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres"),

    // Filtrar los campos no deseados, eliminando cualquier otro campo de `req.body`
    (req, res, next) => {
        const allowedFields = ['year', 'degree', 'student', 'tfgTitle', 'keywords', 'advisor', 'abstract'];
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
    // Validación para los campos específicos
    check("year", "El campo 'year' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'year' debe ser una cadena de texto.")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El campo 'year' debe tener el formato 'XX/XX'."),
    check("degree", "El campo 'degree' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("student", "El campo 'student' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("tfgTitle", "El campo 'tfgTitle' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres"),
    check("keywords", "El campo 'keywords' es obligatorio").not().isEmpty()
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            return true;
        }),
    check("advisor", "El campo 'advisor' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("abstract", "El campo 'abstract' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres"),

    // Filtrar los campos no deseados, eliminando cualquier otro campo de `req.body`
    (req, res, next) => {
        const allowedFields = ['year', 'degree', 'student', 'tfgTitle', 'keywords', 'advisor', 'abstract'];
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

// Validación para actualizar parcialmente un TFG
const validatePatchTFG = [
    check("year").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'year' debe ser una cadena de texto.")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El campo 'year' debe tener el formato 'XX/XX'."),
    check("degree").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("student").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("tfgTitle").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto.")
        .isLength({ min: 10, max: 255 }).withMessage("El título debe tener entre 10 y 255 caracteres"),
    check("keywords").optional({ checkFalsy: true })
        .isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto.")
        .custom(value => {
            if (!value.every(item => typeof item === 'string')) {
                throw new Error("Todos los elementos de 'keywords' deben ser cadenas de texto");
            }
            return true;
        }),
    check("advisor").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("abstract").optional({ checkFalsy: true })
        .isString().withMessage("El campo 'abstract' debe ser una cadena de texto.")
        .isLength({ min: 50 }).withMessage("El resumen debe tener al menos 50 caracteres"),
    (req, res, next) => validateResults(req, res, next)
];

const validateSearcher = [
    check("page_number").not().isEmpty().withMessage("El campo 'page_number' es obligatorio.")
        .isInt({ min: 1 }).withMessage("El campo 'page_number' debe ser un número entero mayor que 0."),
    check("year").optional()
        .isString().withMessage("El campo 'year' debe ser una cadena de texto.")
        .matches(/^\d{2}\/\d{2}$/).withMessage("El campo 'year' debe tener el formato 'XX/XX'."),
    check("degree").optional()
        .isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("advisor").optional()
        .isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("search").optional()
        .isString().withMessage("El campo 'search' debe ser una cadena de texto."),
    (req, res, next) => {
        const allowedFields = ['page_number', 'year', 'degree', 'advisor', 'search'];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key]; // Eliminar los campos que no estén en la lista
            }
        });
        next();
    },
    (req, res, next) => validateResults(req, res, next)
];

const validateVerify = [
    check("verified", "El campo 'verified' es obligatorio").not().isEmpty()
        .isBoolean().withMessage("El campo 'verified' debe ser un valor booleano."),
    check("reason", "El campo 'reason' es obligatorio").not().isEmpty()
        .isString().withMessage("El campo 'reason' debe ser una cadena de texto")
        .isLength({ min: 10 }).withMessage("La razón debe tener al menos 10 caracteres"),

    // Filtrar los campos no deseados, eliminando cualquier otro campo de `req.body`
    (req, res, next) => {
        const allowedFields = ['verified', "reason"];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key]; // Eliminar los campos que no estén en la lista
            }
        });
        next();
    },
    (req, res, next) => validateResults(req, res, next)
];

module.exports = {
    validateIdMongo,
    validateCreateTFG,
    validatePutTFG,
    validatePatchTFG,
    validateSearcher,
    validateVerify
};
