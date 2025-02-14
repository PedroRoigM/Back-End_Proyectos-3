/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { usersModel } = require('../models')
const getUsers = async (req, res) => {
    try {
        const users = await usersModel.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const getUser = async (req, res) => {
    try {
        const user = await usersModel.findById(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
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
