const express = require('express');
const router = express.Router();
const { getTFGs, getTFG, patchTFG, putTFG } = require('../controllers/tfgs');
const { validateGetTFG, validatePatchTFG, validatePutTFG } = require('../validators/tfgs');
router.get('/', getTFGs);
router.get('/:id', validateGetTFG, getTFG);
router.patch('/:id', validatePatchTFG, patchTFG);
router.put('/:id', validatePutTFG, putTFG);
module.exports = router;