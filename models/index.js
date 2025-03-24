const mongoose = require('mongoose');

// Aplicar configuración global de Mongoose
mongoose.set('strictQuery', false);
mongoose.set('runValidators', true); // Para que las validaciones también se ejecuten en updates

// Importar los modelos
const User = require('./nosql/users');
const TFG = require('./nosql/tfgs');
const Degree = require('./nosql/degrees');
const Year = require('./nosql/years');
const Advisor = require('./nosql/advisors');

// Exportar los modelos
module.exports = {
    usersModel: User,
    tfgsModel: TFG,
    degreesModel: Degree,
    yearsModel: Year,
    advisorsModel: Advisor,

    // Utilidad para verificar la conexión
    isConnected: () => mongoose.connection.readyState === 1,
    // Utilidad para desconectar
    disconnect: () => mongoose.disconnect()
};