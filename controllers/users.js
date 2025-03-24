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
 * Registra un nuevo usuario
 * @async
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
const registerCtrl = async (req, res) => {
    try {
        const userData = req.matchedData || req.body;
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
        const { user, token } = await userService.loginUser(email, password);

        createResponse(res, 200, { token, user });
    } catch (error) {
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
        const result = await userService.validateUserAccount(req.user._id, code);
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
        const verificationCode = await userService.requestPasswordRecovery(email);

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
        await userService.recoverPassword(email, code, password);
        createResponse(res, 200, { message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        logger.error('Error recuperando contraseña', { error, email: req.body.email });
        errorHandler(error, res);
    }
};

// TODO: updateRole, getUsersByEmailOrNameAndRole (buscar subcadena en email o nombre (si no recibe nada no poner filtros, va a entrar un unico campo "search" por lo que no diferenciar en la busqueda), tener en cuenta que puede recibir un rol o no)


module.exports = {
    getUsers,
    getUser,
    registerCtrl,
    loginCtrl,
    updateUser,
    deleteUser,
    validateUser,
    recoverPassword,
    requestRecoverPassword
};