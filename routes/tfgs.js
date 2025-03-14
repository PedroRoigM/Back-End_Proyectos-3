const express = require('express');
const router = express.Router();
const multer = require('multer'); // Primero importa multer
const storage = multer.memoryStorage(); // Luego usa multer
const upload = multer({ storage });
const authMiddleware = require('../middleware/session')
const checkRole = require('../middleware/role')
const {
    getTFGs, getTFG, putTFG, createTFG, deleteTFG, patchFileTFG, getNextTFGS, patchVerifiedTFG,
    getTFGsNames, getFileTFG
} = require('../controllers/tfgs');
const {
    validateIdMongo, validateCreateTFG, validatePatchTFG, validatePutTFG, validateSearcher, validateVerify
} = require('../validators/tfgs');

router.get('/', authMiddleware, getTFGs);
router.get('/names', authMiddleware, getTFGsNames)
router.get('/:id', authMiddleware, validateIdMongo, getTFG);
router.get('/pdf/:id', validateIdMongo, getFileTFG);

router.post('/pages/:page_number', authMiddleware, validateSearcher, getNextTFGS);
router.post('/', authMiddleware, validateCreateTFG, createTFG);

router.put('/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, validatePutTFG, putTFG);
//router.patch('/:id', validateIdMongo, validatePatchTFG, patchFileTFG);
router.patch('/pdf/:id', authMiddleware, upload.single("file"), validateIdMongo, patchFileTFG);
router.patch('/verify/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, validateVerify, patchVerifiedTFG);
router.delete('/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, deleteTFG);

module.exports = router;
