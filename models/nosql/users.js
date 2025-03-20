const mongoose = require('mongoose')
const Schema = new mongoose.Schema(
    {
        "name": { type: String, required: true },
        "email": { type: String, required: true, unique: true },
        "password": { type: String, required: true },
        "role": { type: String, enum: ["administrador", "coordinador", "usuario"], default: "usuario" },
        "validated": { type: Boolean, default: false },
        "athempts": { type: Number, default: 0 },
        "code": { type: String, default: null },
    },
    {
        timestamps: true,
        versionKey: false
    }
)
module.exports = mongoose.model('users', Schema)
