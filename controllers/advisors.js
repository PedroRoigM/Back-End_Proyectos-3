/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { advisorsModel } = require('../models')
const { handleHttpError } = require('../utils/handleError')

// Petición GET para obtener todos los grados
// Se obtiene una lista de todos los grados que hay en la base de datos
const getAdvisors = async (req, res) => {
    try {
        const advisor = await advisorsModel.find().select("_id advisor")
        res.status(200).json(advisor)
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_ADVISORS")
    }
}
// Petición POST para crear un grado
// Se crea un grado en la base de datos
// Debe recibir un grado y el usuario que lo ha creado (id de mongoDB)
const createAdvisor = async (req, res) => {
    try {
        const data = matchedData(req)
        console.log(data)
        const advisor = await advisorsModel.create(data)
        res.status(201).json(advisor)
    } catch (error) {
        handleHttpError(res, "ERROR_CREATING_ADVISOR")
    }
}
// Petición DELETE para eliminar un grado
// Se elimina un grado de la base de datos por su id
const deleteAdvisor = async (req, res) => {
    try {
        const { id } = req.params
        const advisor = await advisorsModel.findByIdAndDelete(id)
        res.status(200).json(advisor)
    } catch (error) {
        handleHttpError(res, "ERROR_DELETING_ADVISOR");
    }
}

// Exportar controladores
module.exports = {
    getAdvisors,
    createAdvisor,
    deleteAdvisor
}