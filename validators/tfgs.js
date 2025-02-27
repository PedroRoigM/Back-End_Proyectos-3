const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validateGetTFG = [
    check("id", "El id es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'id' debe ser un ID de MongoDB válido."),
    (req, res, next) => validateResults(req, res, next)
]
const validatePatchTFG = [
    check("id", "El id es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'id' debe ser un ID de MongoDB válido."),
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
// validatePutTFG
const validatePutTFG = [
    check("id", "El id es obligatorio").not().isEmpty()
        .isMongoId().withMessage("El campo 'id' debe ser un ID de MongoDB válido."),
    check("Año", "El campo 'Año' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Año' debe ser una cadena de texto."),
    check("Titulación de Grado", "El campo 'Titulación de Grado' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Titulación de Grado' debe ser una cadena de texto."),
    check("Alumno", "El campo 'Alumno' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Alumno' debe ser una cadena de texto."),
    check("Título TFG", "El campo 'Título TFG' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Título TFG' debe ser una cadena de texto."),
    check("Keywords", "El campo 'Keywords' es obligatorio").not().isEmpty().isArray().withMessage("El campo 'Keywords' debe ser una lista de cadenas de texto."),
    check("Link", "El campo 'Link' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Link' debe ser una cadena de texto."),
    check("Tutor", "El campo 'Tutor' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Tutor' debe ser una cadena de texto."),
    check("Abstact/Resumen", "El campo 'Abstract/Resumen' es obligatorio").not().isEmpty().isString().withMessage("El campo 'Abstract/Resumen' debe ser una cadena de texto."),
    (req, res, next) => validateResults(req, res, next)
]
// validateDeleteTFG
module.exports = { validateGetTFG, validatePatchTFG, validatePutTFG };