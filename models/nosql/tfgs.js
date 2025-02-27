const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const TfgSchema = new mongoose.Schema({
    "Año": { type: String, required: true }, // Año académico
    "Titulación de Grado": { type: String, required: true }, // Titulación de grado
    "Alumno": { type: String, required: true }, // Nombre del alumno
    "Título TFG": { type: String, required: true }, // Título del TFG
    "Keywords": { type: [String], required: true }, // Lista de palabras clave
    "Link": { type: String, required: true }, // Enlace al TFG
    "Tutor": { type: String, required: true }, // Nombre del tutor
    "Abstact/Resumen": { type: String, required: true } // Resumen del trabajo
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

TfgSchema.plugin(mongooseDelete, { overrideMethods: true }); // Añadimos el plugin mongoose-delete
module.exports = mongoose.model('tfgs', TfgSchema); // Exportamos el modelo Tfg