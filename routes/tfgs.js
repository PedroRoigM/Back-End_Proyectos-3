const express = require('express');
const router = express.Router();
const multer = require('multer'); // Primero importa multer
const storage = multer.memoryStorage(); // Luego usa multer
const upload = multer({ storage });

const { uploadMiddlewareMemory } = require("../utils/handleStorage");
const {
    getTFGs, getTFG, patchTFG, putTFG, createTFG, deleteTFG, patchFileTFG, getNextTFGS
} = require('../controllers/tfgs');
const {
    validateIdMongo, validateCreateTFG, validateUpdateTFG, validateFileTFG, validateSearcher
} = require('../validators/tfgs');

router.get('/', getTFGs);
router.get('/:id', validateIdMongo, getTFG);
router.get('/pages/:page_number', validateSearcher, getNextTFGS);
router.post('/', validateCreateTFG, createTFG);
router.patch('/:id', validateIdMongo, validateUpdateTFG, patchTFG);
router.patch('/pdf/:id', validateIdMongo, validateFileTFG, uploadMiddlewareMemory.single("file"), patchFileTFG);
router.put('/:id', validateIdMongo, validateUpdateTFG, putTFG);
router.delete('/:id', validateIdMongo, deleteTFG);

module.exports = router;
