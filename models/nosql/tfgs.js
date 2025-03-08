const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const TfgSchema = new mongoose.Schema({
    "year": { type: String, required: true }, // Año académico
    "degree": { type: String, required: true }, // Titulación de grado
    "student": { type: String, required: true }, // Nombre del alumno
    "tfgTitle": { type: String, required: true }, // Título del TFG
    "keywords": { type: [String], required: true }, // Lista de palabras clave
    "link": { type: String, required: true }, // Enlace al TFG
    "advisor": { type: String, required: true }, // Nombre del tutor
    "abstract": { type: String, required: true }, // Resumen del trabajo
    "verified": { type: Boolean, default: false }, // Verificado
    "verifiedBy": { type: String, default: null }, // Verificado por
    "reason": { type: String, default: null } // Razón de verificación
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

TfgSchema.plugin(mongooseDelete, { overrideMethods: true }); // Añadimos el plugin mongoose-delete
module.exports = mongoose.model('tfgs', TfgSchema); // Exportamos el modelo Tfg