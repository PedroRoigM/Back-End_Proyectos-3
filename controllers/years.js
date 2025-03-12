/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { yearsModel } = require('../models')

// Petición GET para obtener todos los años
// Se obtiene una lista de todos los años que hay en la base de datos
const getYears = async (req, res) => {
    try {
        const years = await yearsModel.find().select("_id year")
        res.status(200).json(years)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición POST para crear un año
// Se crea un año en la base de datos
// Debe recibir un año con formato XX/XX (ejemplo: 21/22)
const createYear = async (req, res) => {
    try {
        const data = matchedData(req)
        const year = await yearsModel.create(data)
        res.status(201).json(year)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición DELETE para eliminar un año
// Se elimina un año de la base de datos por su id
const deleteYear = async (req, res) => {
    try {
        const { id } = req.params
        const year = await yearsModel.findByIdAndDelete(id)
        res.status(200).json(year)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Exportar controladores
module.exports = {
    getYears,
    createYear,
    deleteYear
}