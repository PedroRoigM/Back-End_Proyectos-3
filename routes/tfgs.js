/**
 * Rutas para la gestión de Trabajos Fin de Grado (TFGs)
 * @module routes/tfgs
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const {
    getTFG,
    putTFG,
    createTFG,
    deleteTFG,
    patchFileTFG,
    getNextTFGS,
    patchVerifiedTFG,
    getTFGsNames,
    getFileTFG,
    getFilePhotosTFG,
    getUnverifiedTFGs,
    getTFGs
} = require('../controllers/tfgs');
const {
    validateIdMongo,
    validateCreateTFG,
    validatePutTFG,
    validateSearcher,
    validateVerify,
    validatePatchTFG
} = require('../validators/tfgs');

/**
 * Middleware para roles administrativos (admin y coordinador)
 */
const adminRoles = ['administrador', 'coordinador'];

/**
 * Rutas de consulta
 */
// Listados y búsquedas
router.get('/', authMiddleware, getTFGs);
router.get('/names', authMiddleware, getTFGsNames);
router.post('/pages/:page_number', authMiddleware, validateSearcher, getNextTFGS);
router.post('/unverified/:page_number', authMiddleware, checkRole(adminRoles), validateSearcher, getUnverifiedTFGs);

// Detalles y archivos
router.get('/:id', authMiddleware, validateIdMongo, getTFG);
router.get('/pdf/:id', authMiddleware, validateIdMongo, getFileTFG);
router.get('/pdf/images/:id', authMiddleware, validateIdMongo, getFilePhotosTFG);

/**
 * Rutas de creación y edición
 */
// Creación de TFGs
router.post('/', authMiddleware, validateCreateTFG, createTFG);

// Modificaciones completas
router.put('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, validatePutTFG, putTFG);

// Modificaciones parciales
router.patch('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, validatePatchTFG, putTFG);
router.patch('/pdf/:id', authMiddleware, validateIdMongo, upload.single("file"), patchFileTFG);
router.patch('/verify/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, validateVerify, patchVerifiedTFG);

/**
 * Rutas de eliminación
 */
router.delete('/:id', authMiddleware, checkRole(adminRoles), validateIdMongo, deleteTFG);

module.exports = router;