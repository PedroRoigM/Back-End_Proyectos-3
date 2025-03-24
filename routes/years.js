/**
 * Rutas para la gestión de años académicos
 * @module routes/years
 */
const express = require('express');
const router = express.Router();
const {
    getYears,
    createYear,
    deleteYear,
    updateYear
} = require('../controllers/years');
const {
    validateIdMongo,
    validateYear,
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

/**
 * Rutas de creación y modificación
 * Restringidas a administradores
 */
router.post('/', authMiddleware, checkRole(adminRole), validateYear, createYear);
router.patch('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, validateUpdateYear, updateYear);

/**
 * Rutas de eliminación
 * Restringidas a administradores
 */
router.delete('/:id', authMiddleware, checkRole(adminRole), validateIdMongo, deleteYear);

module.exports = router;