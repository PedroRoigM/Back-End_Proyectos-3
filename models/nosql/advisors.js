const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const AdvisorSchema = new mongoose.Schema({
    "advisor": { type: String, required: true, unique: true }, // Nombre del asesor
});

AdvisorSchema.plugin(mongooseDelete, { overrideMethods: true }); // Añadimos el plugin mongoose-delete
module.exports = mongoose.model('advisors', AdvisorSchema); // Exportamos el modelo Advisor