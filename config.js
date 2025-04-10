require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URI,
    PINATA_API_KEY: process.env.PINATA_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET,
    PINATA_GATEWAY_URL: process.env.PINATA_GATEWAY_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    EMAIL: process.env.EMAIL,
};