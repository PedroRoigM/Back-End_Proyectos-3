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
    updateAdvisor,
    getAdvisorsByName
} = require('../controllers/advisors');
const {
    validateAdvisorFields,
    validateIdMongo,
    validateSearchAdvisor,
    validateIsActive
} = require('../validators/advisors');

/**
 * Middleware para roles administrativos
 */
const adminRoles = ['administrador', 'coordinador'];

/**
 * Rutas de consulta
 */
router.post('/get', authMiddleware, validateIsActive, getAdvisors);
router.get('/:id', authMiddleware, validateIdMongo, getAdvisor);

/**
 * Rutas de creación y modificación
 * Restringidas a administradores y coordinadores
 */
router.post('/', authMiddleware, checkRole(adminRoles), validateAdvisorFields, createAdvisor);
router.post('/name', authMiddleware, validateSearchAdvisor, getAdvisorsByName);
router.patch('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, validateIsActive, updateAdvisor);

/**
 * Rutas de eliminación
 * Restringidas a administradores y coordinadores
 */
router.delete('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, deleteAdvisor);

module.exports = router;