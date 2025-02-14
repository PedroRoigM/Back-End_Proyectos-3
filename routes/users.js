const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser } = require('../controllers/users');

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);

module.exports = router;