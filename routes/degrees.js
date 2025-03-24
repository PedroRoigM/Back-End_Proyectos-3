/**
 * Rutas para la gestión de grados académicos
 * @module routes/degrees
 */
const express = require('express');
const router = express.Router();
const {
    getDegrees,
    createDegree,
    deleteDegree,
    updateDegree
} = require('../controllers/degrees');
const {
    validateIdMongo,
    validateDegree,
    validateUpdateDegree
} = require('../validators/degrees');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');

/**
 * Middleware para roles administrativos
 */
const adminRole = ["administrador"];

/**
 * Rutas de consulta
 */
router.get('/', authMiddleware, getDegrees);

/**
 * Rutas de creación y modificación
 * Restringidas a administradores
 */
router.post('/', authMiddleware, checkRole(adminRole), validateDegree, createDegree);
router.patch('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, validateUpdateDegree, updateDegree);

/**
 * Rutas de eliminación
 * Restringidas a administradores
 */
router.delete('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, deleteDegree);

module.exports = router;