/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/

// Funcioens importantes para los usuarios de la web: getUsers, getUser, createUser
// Así permite crear, leer y obtener usuarios de la base de datos

// Obtener el modelo de usuarios
const { usersModel } = require('../models')

// Petición GET para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await usersModel.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Petición GET para obtener un usuario en específico según su ID
const getUser = async (req, res) => {
    try {
        const user = await usersModel.findById(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Petición POST para crear un usuario
const createUser = async (req, res) => {
    try {
        const user = new usersModel(req.body)
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getUsers,
    getUser,
    createUser
}
