const mongoose = require('mongoose');

const dbConnect = async () => {
    // Configuración de la conexión a la base de datos
    const DB_URI = process.env.NODE_ENV === 'test'
        ? process.env.DB_URI_TEST
        : process.env.DB_URI;

    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
};

module.exports = dbConnect;