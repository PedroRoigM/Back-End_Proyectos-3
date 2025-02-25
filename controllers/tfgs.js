/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { tfgsModel } = require('../models')

// Petición GET para obtener todos los tfgs
const getTFGs = async (req, res) => {
    try {
        const tfgs = await tfgsModel.find()
        res.status(200).json(tfgs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const getTFG = async (req, res) => {
    try {
        const { id } = req.params
        const tfg = await tfgsModel.findById(id)
        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const patchTFG = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req
        const tfg = await tfgsModel.findByIdAndUpdate(id, body, { new: true })
        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports = { getTFGs, getTFG, patchTFG }