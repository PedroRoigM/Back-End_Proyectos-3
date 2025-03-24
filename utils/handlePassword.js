const bcryptjs = require('bcryptjs');

const encrypt = async (clearPassword) => {
    try {
        const trimmedPassword = clearPassword.trim();

        // Generar salt de forma síncrona para más control
        const salt = bcryptjs.genSaltSync(10);

        // Hashear de forma síncrona
        const hash = bcryptjs.hashSync(trimmedPassword, salt);
        return hash;
    } catch (error) {
        throw error;
    }
};

const compare = async (clearPassword, hashedPassword) => {
    try {
        // Probar múltiples formas de comparación
        const methods = [
            () => bcryptjs.compareSync(clearPassword.trim(), hashedPassword),
            () => bcryptjs.compareSync(clearPassword, hashedPassword),
            () => bcryptjs.compareSync(clearPassword.normalize('NFC'), hashedPassword),
            () => bcryptjs.compareSync(clearPassword.normalize('NFD'), hashedPassword)
        ];

        for (const method of methods) {
            const result = method();
            if (result) return true;
        }

        return false;
    } catch (error) {
        console.error('Error en comparación:', error);
        return false;
    }
};

module.exports = { encrypt, compare };
