const express = require('express');
const router = express.Router();
const multer = require('multer'); // Primero importa multer
const storage = multer.memoryStorage(); // Luego usa multer
const upload = multer({ storage });

const {
    getTFGs, getTFG, putTFG, createTFG, deleteTFG, patchFileTFG, getNextTFGS, patchVerifiedTFG
} = require('../controllers/tfgs');
const {
    validateIdMongo, validateCreateTFG, validatePatchTFG, validatePutTFG, validateSearcher, validateVerify
} = require('../validators/tfgs');

router.get('/', getTFGs);

router.get('/:id', validateIdMongo, getTFG);
router.post('/pages/:page_number', validateSearcher, getNextTFGS);
router.post('/', validateCreateTFG, createTFG);
router.put('/:id', validateIdMongo, validatePutTFG, putTFG);
//router.patch('/:id', validateIdMongo, validatePatchTFG, patchFileTFG);
router.patch('/pdf/:id', upload.single("file"), validateIdMongo, patchFileTFG);
router.patch('/verify/:id', validateIdMongo, validateVerify, patchVerifiedTFG);
router.delete('/:id', validateIdMongo, deleteTFG);

module.exports = router;
