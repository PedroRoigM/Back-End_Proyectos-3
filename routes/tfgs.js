const express = require('express');
const router = express.Router();
const multer = require('multer'); // Primero importa multer
const storage = multer.memoryStorage(); // Luego usa multer
const upload = multer({ storage });
const authMiddleware = require('../middleware/session')
const checkRole = require('../middleware/role')
const {
    getTFG, putTFG, createTFG, deleteTFG, patchFileTFG, getNextTFGS, patchVerifiedTFG,
    getTFGsNames, getFileTFG, getUnverifiedTFGs
} = require('../controllers/tfgs');
const {
    validateIdMongo, validateCreateTFG, validatePutTFG, validateSearcher, validateVerify
} = require('../validators/tfgs');

router.get('/names', authMiddleware, getTFGsNames)
router.get('/:id', authMiddleware, validateIdMongo, getTFG);
router.get('/pdf/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, getFileTFG);

router.post('/', authMiddleware, validateCreateTFG, createTFG);
router.post('/unverified/:page_number', authMiddleware, checkRole(['administrador', 'coordinador']), validateSearcher, getUnverifiedTFGs);
router.post('/pages/:page_number', authMiddleware, validateSearcher, getNextTFGS);


router.put('/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, validatePutTFG, putTFG);

router.patch('/pdf/:id', authMiddleware, upload.single("file"), validateIdMongo, patchFileTFG);
router.patch('/verify/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, validateVerify, patchVerifiedTFG);

router.delete('/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, deleteTFG);

module.exports = router;
