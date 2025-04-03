/**
 * Rutas para la gestión de años académicos
 * @module routes/years
 */
const express = require('express');
const router = express.Router();
const {
    getYears,
    getYear,
    getCurrentYear,
    createYear,
    deleteYear,
    updateYear
} = require('../controllers/years');
const {
    validateIdMongo,
    validateUpdateYear
} = require('../validators/years');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');

/**
 * Middleware para roles administrativos
 */
const adminRole = ["administrador"];

/**
 * Rutas de consulta
 */
router.get('/', authMiddleware, getYears);
router.get('/current', authMiddleware, getCurrentYear);
router.get('/:id', authMiddleware, validateIdMongo, getYear);

/**
 * Rutas de creación y modificación
 * Restringidas a administradores
 */
router.post('/', authMiddleware, checkRole(adminRole), createYear);
router.patch('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, validateUpdateYear, updateYear);

/**
 * Rutas de eliminación
 * Restringidas a administradores
 */
router.delete('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, deleteYear);

module.exports = router;