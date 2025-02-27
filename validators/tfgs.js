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
    check("Año", "El campo 'Año' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Año' debe ser una cadena de texto."),
    check("Titulación de Grado", "El campo 'Titulación de Grado' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Titulación de Grado' debe ser una cadena de texto."),
    check("Alumno", "El campo 'Alumno' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Alumno' debe ser una cadena de texto."),
    check("Título TFG", "El campo 'Título TFG' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Título TFG' debe ser una cadena de texto."),
    check("Keywords", "El campo 'Keywords' es obligatorio").not().isEmpty().isArray().withMessage("El campo 'Keywords' debe ser una lista de cadenas de texto."),
    check("Tutor", "El campo 'Tutor' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Tutor' debe ser una cadena de texto."),
    check("Abstact/Resumen", "El campo 'Abstract/Resumen' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Abstract/Resumen' debe ser una cadena de texto."),

    // El campo link vendra en un patch que se encargará de subirlo al endpoint, por lo que no se pide para crear un TFG

    (req, res, next) => validateResults(req, res, next)
]

// Validación para actualizar un TFG, se valida que los campos sean opcionales y que cumplan con el tipo de dato esperado
// Se valida que los campos sean opcionales para que no sea obligatorio enviar todos los campos en el patch
const validateUpdateTFG = [
    check("Año").optional().isString().withMessage("El campo 'Año' debe ser una cadena de texto."),
    check("Titulación de Grado").optional().isString().withMessage("El campo 'Titulación de Grado' debe ser una cadena de texto."),
    check("Alumno").optional().isString().withMessage("El campo 'Alumno' debe ser una cadena de texto."),
    check("Título TFG").optional().isString().withMessage("El campo 'Título TFG' debe ser una cadena de texto."),
    check("Keywords").optional().isArray().withMessage("El campo 'Keywords' debe ser una lista de cadenas de texto."),
    check("Link").optional().isString().withMessage("El campo 'Link' debe ser una cadena de texto."),
    check("Tutor").optional().isString().withMessage("El campo 'Tutor' debe ser una cadena de texto."),
    check("Abstract/Resumen").optional().isString().withMessage("El campo 'Abstract/Resumen' debe ser una cadena de texto."),
    (req, res, next) => validateResults(req, res, next)
]

// Validación para subir un archivo PDF en el patch de un TFG, se valida que el archivo sea un PDF para luego subirlo al endpoint
const validateFileTFG = [
    // Se valida que el archivo sea un PDF
    check("file", "El archivo es obligatorio").not().isEmpty()
        .matches(/\.pdf$/).withMessage("El archivo debe ser un PDF válido."),
    (req, res, next) => validateResults(req, res, next)
]
const validateIdForPage = [
    check("lastId").optional().isMongoId().withMessage("El campo 'lastId' debe ser un ID de MongoDB válido."),
    (req, res, next) => validateResults(req, res, next)
]
module.exports = { validateIdMongo, validateCreateTFG, validateUpdateTFG, validateFileTFG, validateIdForPage };