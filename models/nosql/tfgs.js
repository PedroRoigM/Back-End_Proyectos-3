const mongoose = require('mongoose')
const Schema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        author: { type: String, required: true },
        year: { type: Number, required: true },
        keywords: { type: [String], required: true },
        area: { type: String, required: true },
        course: { type: String, required: true },
        file: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false
    }
)
module.exports = mongoose.model('tfg', Schema)