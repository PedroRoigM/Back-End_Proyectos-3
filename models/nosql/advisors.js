const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const AdvisorSchema = new mongoose.Schema({
    advisor: {
        type: String,
        required: [true, 'El nombre del tutor es obligatorio'],
        unique: true,
        trim: true,
        index: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para mejora de rendimiento
AdvisorSchema.index({ active: 1 });
AdvisorSchema.index({ department: 1 });
AdvisorSchema.index({ specialties: 1 });

// Método para obtener tutores activos
AdvisorSchema.statics.findActive = function () {
    return this.find({ active: true });
};

// Método para buscar por especialidad
AdvisorSchema.statics.findBySpecialty = function (specialty) {
    return this.find({
        specialties: specialty,
        active: true
    });
};

// Middleware para transformar los nombres a un formato consistente
AdvisorSchema.pre('save', function (next) {
    // Capitalizar cada palabra del nombre
    if (this.advisor) {
        this.advisor = this.advisor
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    next();
});

// Plugin para eliminación suave
AdvisorSchema.plugin(mongooseDelete, {
    overrideMethods: true,
    deletedAt: true
});

module.exports = mongoose.model('advisors', AdvisorSchema);