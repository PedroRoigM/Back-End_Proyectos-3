const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const TfgSchema = new mongoose.Schema({
    year: {
        type: String,
        required: [true, 'El año académico es obligatorio'],
        match: [/^\d{2}\/\d{2}$/, 'El formato debe ser XX/XX (ej. 22/23)'],
        index: true
    },
    degree: {
        type: String,
        required: [true, 'La titulación es obligatoria'],
        index: true,
        ref: 'degrees' // Referencia al modelo de titulaciones
    },
    student: {
        type: String,
        required: [true, 'El nombre del alumno es obligatorio'],
        trim: true,
        index: true
    },
    tfgTitle: {
        type: String,
        required: [true, 'El título del TFG es obligatorio'],
        trim: true,
        index: true
    },
    keywords: {
        type: [String],
        required: [true, 'Las palabras clave son obligatorias'],
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Debe incluir al menos una palabra clave'
        },
        index: true
    },
    link: {
        type: String,
        required: [true, 'El enlace al TFG es obligatorio']
    },
    advisor: {
        type: String,
        required: [true, 'El nombre del tutor es obligatorio'],
        ref: 'advisors', // Referencia al modelo de tutores
        index: true
    },
    abstract: {
        type: String,
        required: [true, 'El resumen del trabajo es obligatorio'],
        trim: true
    },
    verified: {
        type: Boolean,
        default: false,
        index: true
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    reason: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices compuestos para consultas comunes
TfgSchema.index({ year: 1, degree: 1 });
TfgSchema.index({ verified: 1, year: 1 });
TfgSchema.index({ verified: 1, degree: 1 });
TfgSchema.index({ 'keywords': 'text', 'tfgTitle': 'text', 'abstract': 'text' });

// Virtual para obtener la URL completa
TfgSchema.virtual('fullUrl').get(function () {
    const config = require('../../config');
    return this.link ? `${config.BASE_URL}/api/tfgs/pdf/${this._id}` : null;
});

// Método para verificar un TFG
TfgSchema.methods.verify = function (userId, reason = 'Verificado correctamente') {
    this.verified = true;
    this.verifiedBy = userId;
    this.reason = reason;
    return this.save();
};

// Método para incrementar contadores
TfgSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

TfgSchema.methods.incrementDownloads = function () {
    this.downloadCount += 1;
    return this.save();
};

// Métodos estáticos para consultas comunes
TfgSchema.statics.findByKeywords = function (keywords) {
    return this.find({ keywords: { $in: Array.isArray(keywords) ? keywords : [keywords] } });
};

TfgSchema.statics.findVerified = function () {
    return this.find({ verified: true });
};

TfgSchema.statics.search = function (query) {
    return this.find({
        $text: { $search: query },
        verified: true
    });
};

TfgSchema.statics.findPaginated = async function (query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        this.find(query).skip(skip).limit(limit),
        this.countDocuments(query)
    ]);

    return {
        data,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
};

// Plugin para eliminación suave
TfgSchema.plugin(mongooseDelete, {
    overrideMethods: true,
    deletedAt: true
});

module.exports = mongoose.model('tfgs', TfgSchema);