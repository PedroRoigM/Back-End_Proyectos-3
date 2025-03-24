const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongooseDelete = require('mongoose-delete');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
            maxlength: [100, 'El nombre no debe exceder 100 caracteres']
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
            select: true
        },
        role: {
            type: String,
            enum: {
                values: ["administrador", "coordinador", "usuario"],
                message: '{VALUE} no es un rol válido'
            },
            default: "usuario"
        },
        validated: {
            type: Boolean,
            default: false
        },
        attempts: {
            type: Number,
            default: 0,
            max: [5, 'Número máximo de intentos excedido']
        },
        code: {
            type: String,
            default: null
        },
        lastLogin: {
            type: Date
        },
        passwordResetExpires: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices para mejora de rendimiento
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ validated: 1 });

// Método para verificar contraseña
UserSchema.methods.comparePassword = async function (candidatePassword) {
    console.log('Método comparePassword - Información detallada:', {
        candidatePassword,
        storedHash: this.password
    });

    try {
        // Probar múltiples variaciones
        const variations = [
            candidatePassword.trim(),
            candidatePassword,
            candidatePassword.replace(/\s/g, ''),
            candidatePassword.normalize('NFC'),
            candidatePassword.normalize('NFD')
        ];

        for (const variant of variations) {
            console.log(`Probando variante: "${variant}"`);
            const isMatch = await bcrypt.compare(variant, this.password);
            console.log(`Resultado de variante "${variant}":`, isMatch);

            if (isMatch) return true;
        }

        return false;
    } catch (error) {
        console.error('Error en comparación de contraseñas:', error);
        return false;
    }
};


// Método para generar código de validación
UserSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.code = code;
    this.attempts = 0;
    return code;
};

// Método para verificar si el usuario está bloqueado
UserSchema.methods.isLocked = function () {
    return this.attempts >= 5;
};



// Método estático para buscar por correo electrónico
UserSchema.statics.findByEmail = function (email) {
    console.log('Buscando usuario por email:', email);
    return this.findOne({ email: email.toLowerCase() });
};

// Método para obtener datos seguros sin campos sensibles
UserSchema.methods.getSafeData = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.code;
    delete userObject.attempts;
    return userObject;
};

// Eliminar virtualmente en lugar de permanentemente
UserSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true
});

module.exports = mongoose.model('users', UserSchema);