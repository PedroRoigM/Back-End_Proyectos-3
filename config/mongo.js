const mongoose = require('mongoose');
const config = require("../config");

const dbConnect = () => {
    mongoose.set('strictQuery', false);
    try {
        mongoose.connect(config.DB_URI)
            .then(() => {
                console.log("Conectado a la BD");
            })
            .catch(err => {
                console.error("Error conectando a la BD:", err);
            });
    } catch (error) {
        console.error("Error conectando a la BD:", error);
    }
};

module.exports = dbConnect;