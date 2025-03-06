const mongoose = require('mongoose')
const Schema = new mongoose.Schema(
    {
        "name": { type: String, required: true },
        "email": { type: String, required: true, unique: true },
        "password": { type: String, required: true },
        "role": { type: String, type: ["alumno", "profesor", "tutor", "administrador"], default: "alumno", required: true },
    },
    {
        timestamps: true,
        versionKey: false
    }
)
module.exports = mongoose.model('users', Schema)
