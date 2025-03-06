const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser } = require('../controllers/users');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');

router.get("/", authMiddleware, getUsers)
router.get('/:id', authMiddleware, getUser);
router.post('/', authMiddleware, checkRole(["admin"]), createUser);


module.exports = router;