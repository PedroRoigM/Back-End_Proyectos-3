/**
 * Rutas para la gestión de usuarios
 * @module routes/users
 */
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    loginCtrl,
    registerCtrl,
    validateUser,
    requestRecoverPassword,
    recoverPassword,
    deleteUser
} = require('../controllers/users');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const {
    validatorGetUser,
    validatorUpdateUser,
    validatorLogin,
    validatorRegister,
    validatorValidateUser,
    validatorRequestRecoverPassword,
    validatorRecoverPassword
} = require('../validators/users');

/**
 * Rutas públicas (no requieren autenticación)
 */
// Autenticación y registro
router.post('/register', validatorRegister, registerCtrl);
router.post('/login', validatorLogin, loginCtrl);

// Recuperación de contraseña
router.post('/recover-password', validatorRequestRecoverPassword, requestRecoverPassword);
router.patch('/recover-password', validatorRecoverPassword, recoverPassword);

/**
 * Rutas protegidas (requieren autenticación)
 */
// Validación de cuenta
router.post('/validate', authMiddleware, validatorValidateUser, validateUser);

// Obtención y gestión de usuarios
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, validatorGetUser, getUser);
router.patch('/:id', authMiddleware, validatorGetUser, validatorUpdateUser, updateUser);
router.delete('/:id', authMiddleware, checkRole(["administrador"]), validatorGetUser, deleteUser);

module.exports = router;