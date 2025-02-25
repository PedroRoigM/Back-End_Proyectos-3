const express = require('express');
const router = express.Router();
const { getTFGs, getTFG, patchTFG } = require('../controllers/tfgs');
const { validateGetTFG, validatePatchTFG } = require('../validators/tfgs');
router.get('/', getTFGs);
router.get('/:id', validateGetTFG, getTFG);
router.patch('/:id', validatePatchTFG, patchTFG);
module.exports = router;