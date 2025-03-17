const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, loginCtrl, registerCtrl, validateUser } = require('../controllers/users');
const authMiddleware = require('../middleware/session');
const checkRole = require('../middleware/role');
const { validatorGetUser,
    validatorUpdateUser,
    validatorLogin,
    validatorRegister,
    validatorValidateUser } = require('../validators/users');

router.post('/register', validatorRegister, registerCtrl);
router.post('/login', validatorLogin, loginCtrl);
router.patch('/validate', authMiddleware, validatorValidateUser, validateUser);

router.get("/", authMiddleware, getUsers)
router.patch('/:id', authMiddleware, checkRole(["administrador"]), validatorGetUser, validatorUpdateUser, updateUser);





module.exports = router;