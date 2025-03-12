const express = require('express');
const router = express.Router();
const { getDegrees, createDegree, deleteDegree } = require('../controllers/degrees');
const { validateIdMongo, validateDegree } = require('../validators/degrees');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
router.get('/', authMiddleware, getDegrees);
router.post('/', authMiddleware, checkRole(["administrador"]), validateDegree, createDegree);
router.delete('/:id', authMiddleware, checkRole(["administrador"]), validateIdMongo, deleteDegree);

module.exports = router;