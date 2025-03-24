const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const DegreeSchema = new mongoose.Schema({
    degree: {
        type: String,
        required: [true, 'El nombre de la titulación es obligatorio'],
        unique: true,
        trim: true,
        index: true
    },
    abbreviation: {
        type: String,
        trim: true
    },
    faculty: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Métodos estáticos para consultas comunes
DegreeSchema.statics.findActive = function () {
    return this.find({ active: true });
};

DegreeSchema.statics.findByName = function (name) {
    return this.findOne({
        degree: { $regex: new RegExp(name, 'i') }
    });
};

// Middleware para transformar los nombres a un formato consistente
DegreeSchema.pre('save', function (next) {
    // Capitalizar cada palabra
    if (this.degree) {
        this.degree = this.degree
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    next();
});

// Plugin para eliminación suave
DegreeSchema.plugin(mongooseDelete, {
    overrideMethods: true,
    deletedAt: true
});

module.exports = mongoose.model('degrees', DegreeSchema);