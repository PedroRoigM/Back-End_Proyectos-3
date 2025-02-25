const express = require('express');
const router = express.Router();
const { getTFGs } = require('../controllers/tfgs');

router.get('/', getTFGs);

module.exports = router;