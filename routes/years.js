const express = require('express');
const router = express.Router();
const { getYears, createYear, deleteYear } = require('../controllers/years');
const { validateIdMongo, validateYear } = require('../validators/years');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');

router.get('/', authMiddleware, getYears);
router.post('/', authMiddleware, checkRole(["administrador"]), validateYear, createYear);
router.delete('/:id', authMiddleware, checkRole(["administrador"]), validateIdMongo, deleteYear);

module.exports = router;