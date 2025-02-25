const mongoose = require('mongoose');

const TfgSchema = new mongoose.Schema({
    year: { type: String, required: true }, // Año académico
    degree: { type: String, required: true }, // Titulación de grado
    student: { type: String, required: true }, // Nombre del alumno
    title: { type: String, required: true }, // Título del TFG
    keywords: { type: [String], required: true }, // Lista de palabras clave
    link: { type: String, required: true }, // Enlace al TFG
    tutor: { type: String, required: true }, // Nombre del tutor
    abstract: { type: String, required: true } // Resumen del trabajo
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

module.exports = mongoose.model('tfgs', TfgSchema); // Exportamos el modelo Tfg