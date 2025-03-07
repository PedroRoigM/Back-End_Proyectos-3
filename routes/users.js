const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser } = require('../controllers/users');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const { validatorGetUser, validatorUpdateUser } = require('../validators/users');

router.get("/", authMiddleware, getUsers)
router.patch('/:id', authMiddleware, checkRole(["administrador"]), validatorGetUser, validatorUpdateUser, updateUser);


module.exports = router;