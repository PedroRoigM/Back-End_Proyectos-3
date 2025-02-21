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
const getTFGByString = async (req, res) => {
    try {
        const search = req.params.search
        const tfg = await tfgsModel.find({
            $or: [{ curso: { $regex: search, $options: "i" } },
            { area: { $regex: search, $options: "i" } },
            { titulacion: { $regex: search, $options: "i" } },
            { titulo: { $regex: search, $options: "i" } },
            { keywords: { $regex: search, $options: "i" } },
            { resumen: { $regex: search, $options: "i" } },
            { contenido: { $regex: search, $options: "i" } }]
        })

        res.status(200).json(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const getTFGByParameters = async (req, res) => {
    try {
        const { curso, area, titulacion, titulo, keywords, resumen, contenido } = req.body
        const tfg = await tfgsModel.find({
            $or: [{ curso: { $regex: curso, $options: "i" } },
            { area: { $regex: area, $options: "i" } },
            { titulacion: { $regex: titulacion, $options: "i" } },
            { titulo: { $regex: titulo, $options: "i" } },
            { keywords: { $regex: keywords, $options: "i" } },
            { resumen: { $regex: resumen, $options: "i" } },
            { contenido: { $regex: contenido, $options: "i" } }]
        })
        res.status(200).json(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Para obtener sugerencias a la hora de buscar
const getTFGByName = async (req, res) => {
    try {
        const search = req.params.search
        const tfg = await tfgsModel.find({
            $or: [{ titulo: { $regex: search, $options: "i" } }]
        })
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
    createTfg,
    getTFGByString,
    getTFGByParameters,
    getTFGByName
}