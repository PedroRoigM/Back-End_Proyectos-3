const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const DegreeSchema = new mongoose.Schema({
    "degree": { type: String, required: true, unique: true }, // Titulación de grado
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

DegreeSchema.plugin(mongooseDelete, { overrideMethods: true }); // Añadimos el plugin mongoose-delete
module.exports = mongoose.model('degrees', DegreeSchema); // Exportamos el modelo Degree