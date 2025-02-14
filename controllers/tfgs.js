/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { tfgsModel } = require('../models')
const getTfgs = async (req, res) => {
    try {
        const tfgs = await tfgsModel.find()
        res.status(200).json(tfgs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const getTfg = async (req, res) => {
    try {
        const tfg = await tfgsModel.findById(req.params.id)
        res.status(200).json(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const createTfg = async (req, res) => {
    try {
        const tfg = new tfgsModel(req.body)
        await tfg.save()
        res.status(201).json(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
module.exports = {
    getTfgs,
    getTfg,
    createTfg
}