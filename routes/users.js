const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, loginCtrl, registerCtrl } = require('../controllers/users');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const { validatorGetUser,
    validatorUpdateUser,
    validatorLogin,
    validatorRegister } = require('../validators/users');

router.get("/", authMiddleware, getUsers)
router.patch('/:id', authMiddleware, checkRole(["administrador"]), validatorGetUser, validatorUpdateUser, updateUser);

router.post('/register', validatorRegister, registerCtrl)
router.post('/login', validatorLogin, loginCtrl)


module.exports = router;