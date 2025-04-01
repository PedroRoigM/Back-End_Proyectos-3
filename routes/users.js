/**
 * Rutas para la gestión de usuarios
 * @module routes/users
 */
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    searchUsers,
    updateUser,
    updateRole,
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
    validatorUpdateRole,
    validatorLogin,
    validatorRegister,
    validatorValidateUser,
    validatorRequestRecoverPassword,
    validatorRecoverPassword,
    validatorSearchUsers
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
router.get('/search', authMiddleware, validatorSearchUsers, searchUsers);
router.get('/:id', authMiddleware, validatorGetUser, getUser);
router.patch('/:id', authMiddleware, validatorGetUser, validatorUpdateUser, updateUser);
router.patch('/:id/role', authMiddleware, checkRole(["administrador"]), validatorGetUser, validatorUpdateRole, updateRole);
router.delete('/:id', authMiddleware, checkRole(["administrador"]), validatorGetUser, deleteUser);

module.exports = router;