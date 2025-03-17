const mongoose = require('mongoose')
const Schema = new mongoose.Schema(
    {
        "name": { type: String, required: true },
        "email": { type: String, required: true, unique: true },
        "password": { type: String, required: true },
        "role": { type: String, enum: ["administrador", "coordinador", "usuario"], default: "usuario" },
        "code": { type: String, required: false },
        'validated': { type: Boolean, default: false },
        'athempts': { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false
    }
)
module.exports = mongoose.model('users', Schema)
