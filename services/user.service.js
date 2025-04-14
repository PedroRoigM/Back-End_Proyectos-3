/**
 * Servicio para la gestión de usuarios
 * @module services/user.service
 */
const { usersModel } = require('../models');
const { encrypt, compare } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/handleMails');
const config = require('../config');

/**
 * Envía un código de verificación por email
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @param {string} type - Tipo de código (verification o recovery)
 * @returns {Promise<void>}
 */
const sendVerificationCode = async (email, code, type = 'verification') => {
    try {
        let subject, text;

        if (type === 'recovery') {
            subject = 'Código de recuperación de contraseña';
            text = `Tu código de recuperación de contraseña es: ${code}. Este código expirará en 15 minutos.`;
        } else {
            subject = 'Código de verificación';
            text = `Tu código de verificación es: ${code}. Este código expirará en 5 minutos.`;
        }

        // Crear el objeto de correo
        const mailOptions = {
            from: config.email,
            to: email,
            subject,
            text
        };

        // Enviar el correo
        await sendEmail(mailOptions);
        console.log(`Código ${type} enviado a ${email}`);
    } catch (error) {
        console.error(`Error al enviar el código de ${type}:`, error);
        throw createError(`ERROR_SENDING_${type.toUpperCase()}_CODE`, 500);
    }
};


/**
 * Obtiene todos los usuarios
 * @async
 * @returns {Promise<Array>} Lista de usuarios
 */
const getAllUsers = async () => {
    try {
        return await usersModel.find({}, {
            password: 0,
            code: 0,
            attempts: 0
        });
    } catch (error) {
        logger.error('Error obteniendo todos los usuarios', { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un usuario por su ID
 * @async
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {Error} Si el usuario no existe
 */
const getUserById = async (id) => {
    try {
        const user = await usersModel.findById(id);

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        return user.getSafeData ? user.getSafeData() : user;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'USER_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de usuario inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error obteniendo usuario por ID: ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Obtiene un usuario por su email
 * @async
 * @param {string} email - Email del usuario
 * @param {boolean} includePassword - Si es true, incluye el campo password
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const getUserByEmail = async (email) => {
    try {
        return await usersModel.find({ email: { $regex: email.email, $options: 'i' } });
    } catch (error) {
        logger.error(`Error obteniendo usuario por email: ${email}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Registra un nuevo usuario
 * @async
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 * @throws {Error} Si el email ya existe
 */
const registerUser = async (userData) => {
    try {
        // Verificar que el email no exista
        const userWithEmail = await getUserByEmail(userData.email);
        if (userWithEmail) {
            throw new Error('EMAIL_ALREADY_EXISTS');
        }

        // Encriptar contraseña
        const hashedPassword = await encrypt(userData.password);
        const newUserData = {
            ...userData,
            password: hashedPassword,
            validated: false
        };

        // Crear usuario
        const user = await usersModel.create(newUserData);

        // Generar código de validación
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await usersModel.findByIdAndUpdate(user._id, { code }, { new: true });
        await sendVerificationCode(user.email, code);
        // Preparar respuesta
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.code;

        // Generar token
        const token = await tokenSign(userResponse);

        return {
            user: userResponse,
            token,
            verificationCode: code
        };
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error('Error de validación al registrar usuario', { error, validationError, userData });
            throw validationError;
        }

        logger.error('Error registrando usuario', { error, userData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Inicia sesión de usuario
 * @async
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario y token
 * @throws {Error} Si credenciales inválidas o cuenta no validada
 */
const loginUser = async (email, password) => {
    try {
        // Buscar usuario con todos los campos
        const user = await usersModel.findOne({ email }).select('+password');

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        // Verificar si la cuenta está bloqueada
        if (user.isLocked && user.isLocked()) {
            throw new Error('ACCOUNT_LOCKED');
        }

        // Verificar contraseña
        const isValid = await user.comparePassword(password);

        if (!isValid) {
            // Incrementar intentos fallidos
            await usersModel.findByIdAndUpdate(user._id, { $inc: { attempts: 1 } });
            throw new Error('INVALID_PASSWORD');
        }

        // Resetear contador de intentos
        await usersModel.findByIdAndUpdate(user._id, { attempts: 0 });

        // Eliminar campos sensibles
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.code;

        // Generar token
        const token = await tokenSign(userResponse);

        return { user: userResponse, token };
    } catch (error) {
        // Preservar errores específicos
        if (['USER_NOT_EXISTS', 'INVALID_PASSWORD', 'ACCOUNT_LOCKED'].includes(error.message)) {
            throw error;
        }

        logger.error(`Error en login de usuario: ${email}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Actualiza datos de usuario
 * @async
 * @param {string} id - ID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
const updateUser = async (id, updateData) => {
    try {
        // Si viene contraseña, encriptarla
        if (updateData.password) {
            updateData.password = await encrypt(updateData.password);
        }

        const user = await usersModel.findByIdAndUpdate(id, updateData, {
            new: true,
            select: '-password -code -attempts',
            runValidators: true
        });

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        return user;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'USER_NOT_EXISTS') {
            throw error;
        }

        // Verificar si es un error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationError = new Error('VALIDATION_ERROR');
            validationError.details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            logger.error(`Error de validación al actualizar usuario ${id}`, { error, validationError, updateData });
            throw validationError;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de usuario inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        // Verificar si es un error de duplicación (índice único)
        if (error.code === 11000) {
            logger.error(`Email duplicado al actualizar usuario ${id}`, { error, updateData });
            throw new Error('EMAIL_ALREADY_EXISTS');
        }

        logger.error(`Error actualizando usuario ${id}`, { error, updateData });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Elimina un usuario
 * @async
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const deleteUser = async (id) => {
    try {
        const result = await usersModel.delete({ _id: id });

        if (!result.deletedCount) {
            throw new Error('USER_NOT_EXISTS');
        }

        return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'USER_NOT_EXISTS') {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de usuario inválido: ${id}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error eliminando usuario ${id}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Valida cuenta de usuario con código
 * @async
 * @param {string} userId - ID del usuario
 * @param {string} code - Código de validación
 * @returns {Promise<boolean>} true si validación exitosa
 * @throws {Error} Si código inválido o intentos excedidos
 */
const validateUserAccount = async (userId, code) => {
    try {
        const user = await usersModel.findById(userId);

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        if (code !== user.code) {
            // Incrementar intentos
            user.attempts += 1;

            if (user.attempts >= 3) {
                await usersModel.findByIdAndUpdate(userId, { code: null });
                throw new Error('MAX_ATTEMPTS');
            }

            await usersModel.findByIdAndUpdate(userId, { attempts: user.attempts });
            throw new Error('INVALID_CODE');
        }

        // Validar usuario
        await usersModel.findByIdAndUpdate(userId, {
            validated: true,
            attempts: 0,
            code: null
        });

        return true;
    } catch (error) {
        // Preservar errores específicos
        if (['USER_NOT_EXISTS', 'INVALID_CODE', 'MAX_ATTEMPTS'].includes(error.message)) {
            throw error;
        }

        // Si es un error de MongoDB por ID inválido
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            logger.error(`ID de usuario inválido: ${userId}`, { error });
            throw new Error('INVALID_ID');
        }

        logger.error(`Error validando cuenta de usuario ${userId}`, { error, code });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Solicita recuperación de contraseña
 * @async
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} Código de verificación
 * @throws {Error} Si usuario no existe
 */
const requestPasswordRecovery = async (email) => {
    try {
        const user = await usersModel.findOne({ email });

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        // Generar código
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await sendVerificationCode(email, code, 'recovery');
        // Guardar código y resetear intentos
        await usersModel.findByIdAndUpdate(user._id, {
            code,
            attempts: 0
        });

        return code;
    } catch (error) {
        // Preservar errores específicos
        if (error.message === 'USER_NOT_EXISTS') {
            throw error;
        }

        logger.error(`Error solicitando recuperación de contraseña para ${email}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

/**
 * Recupera contraseña con código
 * @async
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<boolean>} true si recuperación exitosa
 * @throws {Error} Si código inválido, intentos excedidos o misma contraseña
 */
const recoverPassword = async (email, code, newPassword) => {
    try {
        const user = await usersModel.findOne({ email }).select('+password');

        if (!user) {
            throw new Error('USER_NOT_EXISTS');
        }

        if (user.code !== code) {
            // Incrementar intentos
            user.attempts += 1;

            if (user.attempts >= 3) {
                await usersModel.findByIdAndUpdate(user._id, { code: null });
                throw new Error('MAX_ATTEMPTS');
            }

            await usersModel.findByIdAndUpdate(user._id, { attempts: user.attempts });
            throw new Error('INVALID_CODE');
        }

        // Verificar que la nueva contraseña no sea igual a la anterior
        const isSamePassword = await compare(newPassword, user.password);

        if (isSamePassword) {
            throw new Error('SAME_PASSWORD');
        }

        // Encriptar nueva contraseña
        const hashedPassword = await encrypt(newPassword);

        // Actualizar contraseña, resetear intentos y código
        await usersModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            attempts: 0,
            code: null
        });

        return true;
    } catch (error) {
        // Preservar errores específicos
        if (['USER_NOT_EXISTS', 'INVALID_CODE', 'MAX_ATTEMPTS', 'SAME_PASSWORD'].includes(error.message)) {
            throw error;
        }

        logger.error(`Error recuperando contraseña para ${email}`, { error });
        throw new Error('DEFAULT_ERROR');
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    validateUserAccount,
    requestPasswordRecovery,
    recoverPassword
};