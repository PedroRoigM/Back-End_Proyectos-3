/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { tfgsModel } = require('../models')
const multer = require("multer");


// Petición GET para obtener todos los tfgs
// Se obtiene una lista de todos los TFGs que hay en la base de datos
const getTFGs = async (req, res) => {
    try {
        const tfgs = await tfgsModel.find()
        res.status(200).json(tfgs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición GET para obtener un TFG por su id
// Se obtiene un TFG por su id, debe ser un ID de mongoDB
const getTFG = async (req, res) => {
    try {
        const { id } = req.params
        const tfg = await tfgsModel.findById(id)
        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Petición GET para obtener los 10 siguientes TFGs
// Se obtiene una lista de los 10 siguientes TFGs que hay en la base de datos
const getNextTFGS = async (req, res) => {
    try {
        const { page_number } = req.params;

        // Obtener filtros tanto de req.query como de req.body
        const filters = { ...req.query, ...req.body };

        let query = {};
        if (filters.year) query.year = filters.year;
        if (filters.degree) query.degree = filters.degree;
        if (filters.student) query.student = filters.student;
        if (filters.tfgTitle) query.tfgTitle = { $regex: filters.tfgTitle, $options: "i" };
        if (filters.keywords) query.keywords = { $in: filters.keywords.split(",") };
        if (filters.advisor) query.advisor = filters.advisor;
        if (filters.abstract) query.abstract = { $regex: filters.abstract, $options: "i" };

        console.log("Query generada:", query);

        const page = parseInt(page_number, 10) || 1;
        const tfgs = await tfgsModel.find(query).skip((page - 1) * 10).limit(10);

        res.status(200).json(tfgs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Petición POST para crear un TFG
// Se crea un TFG con los campos que se envíen en el body
// Tras el POST quedará recibir el Link al archivo en el endpoint
const createTFG = async (req, res) => {
    try {
        const body = matchedData(req)
        const data = await tfgsModel.create(body)
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición PATCH para actualizar un TFG, se actualiza solo los campos que se envíen en el body
// En este caso se actualiza solo los campos que se envíen en el body, por lo que no es necesario enviar todos los campos del TFG
const patchTFG = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = matchedData(req)
        const tfg = await tfgsModel.findByIdAndUpdate(id, body, { new: true })
        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición PUT para actualizar un TFG
// En este caso se actualiza el TFG completo, por lo que se debe enviar todos los campos del TFG
const putTFG = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req
        const tfg = await tfgsModel.findByIdAndUpdate(id, body, { new: true })
        res.send(tfg)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// Petición DELETE para eliminar un TFG, hace un soft delete
// El soft delete es una técnica que consiste en no eliminar físicamente un registro de la base de datos, sino que se marca como eliminado
// Esto se hace añadiendo un campo booleano a la tabla que se llama deleted, en caso de que sea true significa que el registro ha sido eliminado
// Luego hay que marcar un tiempo de expiración para que los registros eliminados se eliminen de la base de datos
const deleteTFG = async (req, res) => {
    try {
        const { id } = req.params
        await tfgsModel.delete({ _id: id })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Petición PATCH para subir un archivo PDF, debe subir el archivo al endpoint y actualizar el campo Link del TFG
const patchFileTFG = async (req, res) => {
    try {
        const { id, fileName } = req.params
        const fileBuffer = req.file.buffer
        const pinataResponse = await uploadToPinata(fileBuffer, fileName)
        const ipfsFile = pinataResponse.IpfsHash
        const ipfs_url = `https://${PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`

        const fileData = {
            filename: fileName,
            url: ipfs_url
        }

        //const tfg = await tfgsModel.findByIdAndUpdate(id, { file: file.path }, { new: true })
        res.send(fileData)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getTFGs, getTFG, getNextTFGS, createTFG, patchTFG, putTFG, deleteTFG, patchFileTFG }