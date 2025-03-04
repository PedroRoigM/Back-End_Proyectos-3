require("dotenv").config();

console.log("Cargando variables de entorno...");
console.log("PINATA_API_KEY:", process.env.PINATA_API_KEY);
console.log("PINATA_SECRET_KEY:", process.env.PINATA_SECRET_KEY);

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URI,
    PINATA_API_KEY: process.env.PINATA_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET,
    PINATA_GATEWAY_URL: process.env.PINATA_GATEWAY_URL
};