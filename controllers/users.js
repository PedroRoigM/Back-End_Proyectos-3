/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/

// Funcioens importantes para los usuarios de la web: getUsers, getUser, createUser
// Así permite crear, leer y obtener usuarios de la base de datos

// Obtener el modelo de usuarios
const { usersModel } = require('../models')
const { matchedData } = require('express-validator')
const { handleHttpError } = require('../utils/handleError')

// Petición GET para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const user = req.user
        const data = await usersModel.find({})
        res.send( {data, user} )
    } catch (err) {
        handleHttpError(res, "ERROR_GET_USERS", 403)
    }
}

// Petición GET para obtener un usuario en específico según su ID
const getUser = async (req, res) => {
    try {
        const { user } = matchedData(req)
        const data = await usersModel.findById(user)
        if(!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404) 
        }
        res.send(data)
    } catch (err) {
        handleHttpError(res, "ERROR_GET_USER")
    }
}

// Petición POST para crear un usuario
const createUser = async (req, res) => {
    try {
        const user = matchedData(req)
        const data = await usersModel.create(user)
        res.send(data)
    } catch (err) {
        handleHttpError(res, "ERROR_CREATE_USER")
    }
}

const updateUser = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req)
        const data = await usersModel.findByIdAndUpdate(id, body, { new: true })
        if(!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        res.send(data)
    } catch (err) {
        handleHttpError(res, "ERROR_UPDATE_USER")
    }
}

const deleteUser = async (req, res) => {
    try {
        const { user } = matchedData(req)
        const data = await usersModel.delete( { _id: user } )
        if(!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        res.send( { message: 'User deleted succesfully' } )
    } catch (err) {
        handleHttpError(res, "ERROR_DELETE_USER")
    }
}

// TODO: updateRole

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}
