/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { degreesModel } = require('../models')

// Petición GET para obtener todos los grados
// Se obtiene una lista de todos los grados que hay en la base de datos
const getDegrees = async (req, res) => {
    try {
        const degrees = await degreesModel.find().select("_id degree")
        res.status(200).json(degrees)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición POST para crear un grado
// Se crea un grado en la base de datos
// Debe recibir un grado y el usuario que lo ha creado (id de mongoDB)
const createDegree = async (req, res) => {
    try {
        const data = matchedData(req)
        const degree = await degreesModel.create(data)
        res.status(201).json(degree)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición DELETE para eliminar un grado
// Se elimina un grado de la base de datos por su id
const deleteDegree = async (req, res) => {
    try {
        const { id } = req.params
        const degree = await degreesModel.findByIdAndDelete(id)
        res.status(200).json(degree)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Exportar controladores
module.exports = {
    getDegrees,
    createDegree,
    deleteDegree
}