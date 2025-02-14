const express = require('express');
const router = express.Router();
const { getTfgs,
    getTfg,
    createTfg } = require('../controllers/tfgs');
router.get('/', getTfgs);
router.get('/:id', getTfg);
router.post('/', createTfg);

module.exports = router;