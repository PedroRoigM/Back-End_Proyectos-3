const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const YearSchema = new mongoose.Schema({
    // Año académico
    "year": { type: String, required: true, unique: true },
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false
});

YearSchema.plugin(mongooseDelete, { overrideMethods: true }); // Añadimos el plugin mongoose-delete
module.exports = mongoose.model('years', YearSchema); // Exportamos el modelo Year