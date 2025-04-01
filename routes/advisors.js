/**
 * Rutas para la gestión de asesores/tutores
 * @module routes/advisors
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const {
    getAdvisors,
    getAdvisor,
    createAdvisor,
    deleteAdvisor,
    updateAdvisor
} = require('../controllers/advisors');
const {
    validateIdMongo,
    validateCreateAdvisor,
    validateUpdateAdvisor
} = require('../validators/advisors');

/**
 * Middleware para roles administrativos
 */
const adminRoles = ['administrador', 'coordinador'];

/**
 * Rutas de consulta
 */
router.get('/', authMiddleware, getAdvisors);
router.get('/:id', authMiddleware, validateIdMongo, getAdvisor);

/**
 * Rutas de creación y modificación
 * Restringidas a administradores y coordinadores
 */
router.post('/', authMiddleware, checkRole(adminRoles), validateCreateAdvisor, createAdvisor);
router.patch('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, validateUpdateAdvisor, updateAdvisor);

/**
 * Rutas de eliminación
 * Restringidas a administradores y coordinadores
 */
router.delete('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, deleteAdvisor);

module.exports = router;