const mongoose = require('mongoose')
const config = require("../config")
const dbConnect = () => {
    const db_uri = process.env.DB_URI
    mongoose.set('strictQuery', false)
    try {
        mongoose.connect(config.DB_URI)
    } catch (error) {
        console.error("Error conectando a la BD:", error)
    }
    //Listen events
    mongoose.connection.on("connected", () => console.log("Conectado a la BD"))
}
module.exports = dbConnect
