/**
 * Servicio para la gestión de usuarios
 * @module services/user.service
 */
const { usersModel } = require('../models');
const { encrypt, compare } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

/**
 * Obtiene todos los usuarios
 * @async
 * @returns {Promise<Array>} Lista de usuarios
 */
const getAllUsers = async () => {
    return await usersModel.find({}, {
        password: 0,
        code: 0,
        attempts: 0
    });
};

/**
 * Obtiene un usuario por su ID
 * @async
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {Error} Si el usuario no existe
 */
const getUserById = async (id) => {
    const user = await usersModel.findById(id);

    if (!user) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    return user.safeData; // Usando el virtual para datos seguros
};


/**
 * Obtiene un usuario por su email
 * @async
 * @param {string} email - Email del usuario
 * @param {boolean} includePassword - Si es true, incluye el campo password
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const getUserByEmail = async (email, includePassword = false) => {
    const fields = includePassword ? '+password' : '';
    return await usersModel.findOne({ email }).select(fields);
};

/**
 * Registra un nuevo usuario
 * @async
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 * @throws {Error} Si el email ya existe
 */
const registerUser = async (userData) => {
    console.log('Iniciando registro de usuario:', userData);

    // Verificar que el email no exista
    const userWithEmail = await getUserByEmail(userData.email);
    if (userWithEmail) {
        console.log('Usuario con este email ya existe');
        const error = new Error('EMAIL_ALREADY_EXISTS');
        error.status = 400;
        throw error;
    }

    // Encriptar contraseña
    const hashedPassword = await encrypt(userData.password);
    console.log('Hash de contraseña generado:', hashedPassword);

    const newUserData = {
        ...userData,
        password: hashedPassword,
        validated: true // Activar validación automáticamente para pruebas
    };

    // Crear usuario
    const user = await usersModel.create(newUserData);
    console.log('Usuario creado:', user);

    // Generar código de validación
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await usersModel.findByIdAndUpdate(user._id, { code }, { new: true });

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
    console.log('Inicio de sesión - Información detallada:', {
        email,
        passwordReceived: password,
        passwordLength: password.length
    });

    // Buscar usuario con todos los campos
    const user = await usersModel.findOne({ email }).select('+password');

    if (!user) {
        console.log('Usuario no encontrado');
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    console.log('Usuario encontrado:', {
        email: user.email,
        passwordStored: user.password
    });

    // Verificar contraseña
    const isValid = await user.comparePassword(password);

    console.log('Resultado de verificación:', isValid);

    if (!isValid) {
        console.log('Contraseña inválida');
        const error = new Error('INVALID_PASSWORD');
        error.status = 401;
        throw error;
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
};

/**
 * Actualiza datos de usuario
 * @async
 * @param {string} id - ID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
const updateUser = async (id, updateData) => {
    // Si viene contraseña, encriptarla
    if (updateData.password) {
        updateData.password = await encrypt(updateData.password);
    }

    const user = await usersModel.findByIdAndUpdate(id, updateData, {
        new: true,
        select: '-password -code -attempts'
    });

    if (!user) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    return user;
};

/**
 * Elimina un usuario
 * @async
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const deleteUser = async (id) => {
    const result = await usersModel.delete({ _id: id });

    if (!result.deletedCount) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    return { success: true, message: 'Usuario eliminado correctamente' };
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
    const user = await usersModel.findById(userId);

    if (!user) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    if (code !== user.code) {
        // Incrementar intentos
        user.attempts += 1;

        if (user.attempts >= 3) {
            await usersModel.findByIdAndUpdate(userId, { code: null });
            const error = new Error('MAX_ATTEMPTS');
            error.status = 401;
            throw error;
        }

        await usersModel.findByIdAndUpdate(userId, { attempts: user.attempts });

        const error = new Error('INVALID_CODE');
        error.status = 401;
        throw error;
    }

    // Validar usuario
    await usersModel.findByIdAndUpdate(userId, {
        validated: true,
        attempts: 0,
        code: null
    });

    return true;
};

/**
 * Solicita recuperación de contraseña
 * @async
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} Código de verificación
 * @throws {Error} Si usuario no existe
 */
const requestPasswordRecovery = async (email) => {
    const user = await usersModel.findOne({ email });

    if (!user) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    // Generar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código y resetear intentos
    await usersModel.findByIdAndUpdate(user._id, {
        code,
        attempts: 0
    });

    return code;
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
    const user = await usersModel.findOne({ email }).select('+password');

    if (!user) {
        const error = new Error('USER_NOT_EXISTS');
        error.status = 404;
        throw error;
    }

    if (user.code !== code) {
        // Incrementar intentos
        user.attempts += 1;

        if (user.attempts >= 3) {
            await usersModel.findByIdAndUpdate(user._id, { code: null });
            const error = new Error('MAX_ATTEMPTS');
            error.status = 401;
            throw error;
        }

        await usersModel.findByIdAndUpdate(user._id, { attempts: user.attempts });

        const error = new Error('INVALID_CODE');
        error.status = 401;
        throw error;
    }

    // Verificar que la nueva contraseña no sea igual a la anterior
    const isSamePassword = await compare(newPassword, user.password);

    if (isSamePassword) {
        const error = new Error('SAME_PASSWORD');
        error.status = 400;
        throw error;
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