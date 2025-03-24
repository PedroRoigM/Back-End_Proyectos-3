const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const YearSchema = new mongoose.Schema({
    year: {
        type: String,
        required: [true, 'El año académico es obligatorio'],
        unique: true,
        trim: true,
        match: [/^\d{2}\/\d{2}$/, 'El formato debe ser XX/XX (ej. 22/23)'],
        index: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
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
YearSchema.index({ active: 1 });

// Métodos estáticos para consultas comunes
YearSchema.statics.findActive = function () {
    return this.find({ active: true });
};

YearSchema.statics.findCurrent = function () {
    const now = new Date();
    return this.findOne({
        startDate: { $lte: now },
        endDate: { $gte: now }
    });
};

// Validador para asegurar que startDate sea anterior a endDate
YearSchema.path('endDate').validate(function (value) {
    if (this.startDate && value) {
        return this.startDate < value;
    }
    return true;
}, 'La fecha de fin debe ser posterior a la fecha de inicio');

// Middleware pre-save para dar formato consistente
YearSchema.pre('save', function (next) {
    // Asegurar formato XX/XX
    if (this.year && this.isModified('year')) {
        const match = this.year.match(/^(\d{2})\/(\d{2})$/);
        if (match) {
            // Si no se han proporcionado fechas, generarlas automáticamente
            if (!this.startDate) {
                const startYear = parseInt('20' + match[1], 10);
                this.startDate = new Date(startYear, 8, 1); // 1 de septiembre
            }
            if (!this.endDate) {
                const endYear = parseInt('20' + match[2], 10);
                this.endDate = new Date(endYear, 6, 31); // 31 de julio
            }
        }
    }
    next();
});

// Plugin para eliminación suave
YearSchema.plugin(mongooseDelete, {
    overrideMethods: true,
    deletedAt: true
});

module.exports = mongoose.model('years', YearSchema);