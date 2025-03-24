const bcryptjs = require('bcryptjs');

const encrypt = async (clearPassword) => {
    try {
        const trimmedPassword = clearPassword.trim();

        // Generar salt de forma síncrona para más control
        const salt = bcryptjs.genSaltSync(10);

        // Hashear de forma síncrona
        const hash = bcryptjs.hashSync(trimmedPassword, salt);

        console.log('Proceso de encriptación:', {
            originalPassword: clearPassword,
            trimmedPassword,
            salt,
            hash
        });

        return hash;
    } catch (error) {
        console.error('Error en encriptación:', error);
        throw error;
    }
};

const compare = async (clearPassword, hashedPassword) => {
    try {
        console.log('Comparación detallada:', {
            clearPassword,
            hashedPassword,
            compareResult: bcryptjs.compareSync(clearPassword, hashedPassword)
        });

        // Probar múltiples formas de comparación
        const methods = [
            () => bcryptjs.compareSync(clearPassword.trim(), hashedPassword),
            () => bcryptjs.compareSync(clearPassword, hashedPassword),
            () => bcryptjs.compareSync(clearPassword.normalize('NFC'), hashedPassword),
            () => bcryptjs.compareSync(clearPassword.normalize('NFD'), hashedPassword)
        ];

        for (const method of methods) {
            const result = method();
            console.log('Resultado de comparación:', result);
            if (result) return true;
        }

        return false;
    } catch (error) {
        console.error('Error en comparación:', error);
        return false;
    }
};

module.exports = { encrypt, compare };
