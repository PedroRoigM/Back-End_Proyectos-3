const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validación para el id de MongoDB, se valida que el id sea obligatorio y que sea un ID de MongoDB válido
// Se valida que el id sea obligatorio para que no se pueda hacer una petición sin el id 
const validateIdMongo = [
    check("id", "El id es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'id' debe ser un ID de MongoDB válido."),
    (req, res, next) => validateResults(req, res, next)
]

const validateCreateTFG = [
    check("data.year", "El campo 'year' es obligatorio").not().isEmpty().isString().withMessage("El campo 'year' debe ser una cadena de texto."),
    check("data.degree", "El campo 'degree' es obligatorio").not().isEmpty().isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("data.student", "El campo 'student' es obligatorio").not().isEmpty().isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("data.tfgTitle", "El campo 'tfgTitle' es obligatorio").not().isEmpty().isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto."),
    check("data.keywords", "El campo 'keywords' es obligatorio").not().isEmpty().isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto."),
    check("data.advisor", "El campo 'advisor' es obligatorio").not().isEmpty().isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("data.abstract", "El campo 'abstract' es obligatorio").not().isEmpty().isString().withMessage("El campo 'abstract' debe ser una cadena de texto."),
    check("file", "El archivo es obligatorio").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("El archivo es obligatorio.");
        }
        if (req.file.mimetype !== "application/pdf") {
            throw new Error("El archivo debe ser un PDF.");
        }
        return true;
    }),
    (req, res, next) => validateResults(req, res, next)
];

// Validación para actualizar un TFG, se valida que los campos sean opcionales y que cumplan con el tipo de dato esperado
// Se valida que los campos sean opcionales para que no sea obligatorio enviar todos los campos en el patch
const validateUpdateTFG = [
    check("year").optional({ checkFalsy: true }).isString().withMessage("El campo 'year' debe ser una cadena de texto."),
    check("degree").optional({ checkFalsy: true }).isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("student").optional({ checkFalsy: true }).isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("tfgTitle").optional({ checkFalsy: true }).isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto."),
    check("keywords").optional({ checkFalsy: true }).isArray().withMessage("El campo 'keywords' debe ser una lista de cadenas de texto."),
    check("link").optional({ checkFalsy: true }).isString().withMessage("El campo 'link' debe ser una cadena de texto."),
    check("advisor").optional({ checkFalsy: true }).isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("abstract").optional({ checkFalsy: true }).isString().withMessage("El campo 'abstract' debe ser una cadena de texto."),
    (req, res, next) => validateResults(req, res, next)
]

// Validación para subir un archivo PDF en el patch de un TFG, se valida que el archivo sea un PDF para luego subirlo al endpoint
const validateFileTFG = [
    check("file", "El archivo es obligatorio").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("El archivo es obligatorio.");
        }
        if (req.file.mimetype !== "application/pdf") {
            throw new Error("El archivo debe ser un PDF.");
        }
        return true;
    }),
    check("name", "El nombre del archivo es obligatorio").not().isEmpty()
        .isString().withMessage("El nombre del archivo debe ser una cadena de texto.")
        .isLength({ min: 10, max: 50 }).withMessage("El nombre del archivo debe tener entre 10 y 50 caracteres."),
    (req, res, next) => validateResults(req, res, next)
];

const validateSearcher = [
    check("page_number").not().isEmpty().withMessage("El campo 'page_number' es obligatorio.")
        .isInt({ min: 1 }).withMessage("El campo 'page_number' debe ser un número entero mayor que 0."),
    check("year").optional().isString().withMessage("El campo 'year' debe ser una cadena de texto."),
    check("degree").optional().isString().withMessage("El campo 'degree' debe ser una cadena de texto."),
    check("student").optional().isString().withMessage("El campo 'student' debe ser una cadena de texto."),
    check("tfgTitle").optional().isString().withMessage("El campo 'tfgTitle' debe ser una cadena de texto."),
    check("advisor").optional().isString().withMessage("El campo 'advisor' debe ser una cadena de texto."),
    check("abstract").optional().isString().withMessage("El campo 'abstract' debe ser una cadena de texto."),
    check("keywords").optional().isString().withMessage("El campo 'keywords' debe ser una cadena de texto separada."),
    (req, res, next) => validateResults(req, res, next)
]
module.exports = { validateIdMongo, validateCreateTFG, validateUpdateTFG, validateFileTFG, validateSearcher };