/**
 * Rutas para la gestión de grados académicos
 * @module routes/degrees
 */
const express = require('express');
const router = express.Router();
const {
    getDegrees,
    getDegree,
    createDegree,
    deleteDegree,
    updateDegree,
    getDegreesByName
} = require('../controllers/degrees');
const {
    validateIdMongo,
    validateDegreeFields,
    validateSearchDegree,
    validateChangeActive
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
router.get('/:id', authMiddleware, validateIdMongo, getDegree);

/**
 * Rutas de creación y modificación
 * Restringidas a administradores
 */
router.post('/', authMiddleware, checkRole(adminRole), validateDegreeFields, createDegree);
router.post('/name', authMiddleware, validateSearchDegree, getDegreesByName);
router.patch('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, validateChangeActive, updateDegree);

/**
 * Rutas de eliminación
 * Restringidas a administradores
 */
router.delete('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, deleteDegree);

module.exports = router;