const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session')
const checkRole = require('../middleware/role')
const {
    getAdvisors, createAdvisor, deleteAdvisor
} = require('../controllers/advisors');
const {
    validateIdMongo, validateCreateAdvisor
} = require('../validators/advisors');

router.get('/', authMiddleware, getAdvisors);
router.post('/', authMiddleware, checkRole(['administrador', 'coordinador']), validateCreateAdvisor, createAdvisor);
router.delete('/:id', authMiddleware, checkRole(['administrador', 'coordinador']), validateIdMongo, deleteAdvisor);

module.exports = router;