/**
 * Controlador de usuarios
 * @module controllers/users
 */
const userService = require('../services/user.service');
const { createResponse, errorHandler } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Obtiene todos los usuarios
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        createResponse(res, 200, { data: users, user: req.user });
    } catch (error) {
        logger.error('Error obteniendo usuarios', { error });
        errorHandler(error, res);
    }
};

/**
 * Obtiene un usuario por su ID
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        createResponse(res, 200, user);
    } catch (error) {
        logger.error(`Error obteniendo usuario ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Busca usuarios por correo o nombre
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const searchUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        // Implementar esta funcionalidad en el servicio
        // const users = await userService.searchUsersByEmailOrName(search, role);
        createResponse(res, 200, []); // Placeholder
    } catch (error) {
        logger.error('Error buscando usuarios', { error, search: req.query.search, role: req.query.role });
        errorHandler(error, res);
    }
};

/**
 * Registra un nuevo usuario
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const registerCtrl = async (req, res) => {
    try {
        const userData = req.matchedData || req.body;

        if (!userData || !userData.email || !userData.password || !userData.name) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const { user, token, verificationCode } = await userService.registerUser(userData);

        // Aquí iría la lógica para enviar el código por email
        // await emailService.sendVerificationCode(user.email, verificationCode);

        createResponse(res, 201, { token, user });
    } catch (error) {
        logger.error('Error registrando usuario', { error, userData: req.body });
        errorHandler(error, res);
    }
};

/**
 * Inicia sesión de usuario
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const loginCtrl = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        const { user, token } = await userService.loginUser(email, password);
        createResponse(res, 200, { token, user });
    } catch (error) {
        logger.error('Error en login', { error, email: req.body.email });
        errorHandler(error, res);
    }
};

/**
 * Actualiza los datos de un usuario
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.matchedData || req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Verificar que el usuario existe
        await userService.getUserById(id);

        // Verificar permiso: solo administradores o el mismo usuario pueden actualizar
        const isAuthorized = req.user.role === 'administrador' || req.user._id.toString() === id;
        if (!isAuthorized) {
            return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
        }

        const updatedUser = await userService.updateUser(id, updateData);
        createResponse(res, 200, updatedUser);
    } catch (error) {
        logger.error(`Error actualizando usuario ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Actualiza el rol de un usuario (solo admin)
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        // Si el id es el mismo que el del usuario autenticado, no se puede cambiar el rol
        if (req.user._id.toString() === id) {
            return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
        }
        if (!role || !['administrador', 'coordinador', 'usuario'].includes(role)) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        // Verificar que es administrador
        if (req.user.role !== 'administrador') {
            return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
        }

        // Verificar que el usuario existe
        await userService.getUserById(id);

        const updatedUser = await userService.updateUser(id, { role });
        createResponse(res, 200, updatedUser);
    } catch (error) {
        logger.error(`Error actualizando rol de usuario ${req.params.id}`, { error, role: req.body.role });
        errorHandler(error, res);
    }
};

/**
 * Elimina un usuario
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Solo administradores pueden eliminar usuarios
        if (req.user.role !== 'administrador') {
            return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
        }

        // Verificar que el usuario existe
        await userService.getUserById(id);

        await userService.deleteUser(id);
        createResponse(res, 200, { message: 'Usuario eliminado correctamente' });
    } catch (error) {
        logger.error(`Error eliminando usuario ${req.params.id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Valida la cuenta de un usuario con el código de verificación
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const validateUser = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        await userService.validateUserAccount(req.user._id, code);
        createResponse(res, 200, { message: 'Cuenta validada correctamente' });
    } catch (error) {
        logger.error(`Error validando usuario ${req.user._id}`, { error });
        errorHandler(error, res);
    }
};

/**
 * Solicita la recuperación de contraseña
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const requestRecoverPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        await userService.requestPasswordRecovery(email);

        // Aquí iría la lógica para enviar el código por email
        // await emailService.sendPasswordRecoveryCode(email, verificationCode);

        createResponse(res, 200, { message: 'Código enviado al email' });
    } catch (error) {
        logger.error('Error solicitando recuperación de contraseña', { error, email: req.body.email });
        errorHandler(error, res);
    }
};

/**
 * Recupera la contraseña con el código de verificación
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const recoverPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        if (!email || !code || !password) {
            return errorHandler(new Error('VALIDATION_ERROR'), res);
        }

        await userService.recoverPassword(email, code, password);
        createResponse(res, 200, { message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        logger.error('Error recuperando contraseña', { error, email: req.body.email });
        errorHandler(error, res);
    }
};

module.exports = {
    getUsers,
    getUser,
    searchUsers,
    registerCtrl,
    loginCtrl,
    updateUser,
    updateRole,
    deleteUser,
    validateUser,
    recoverPassword,
    requestRecoverPassword
};