/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { tfgsModel } = require('../models')
const multer = require("multer");
const uploadToPinata = require("../utils/UploadToPinata");

const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL

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
        if (filters.degree) query.degree = { $regex: filters.degree, $options: "i" };
        if (filters.student) query.student = filters.student;
        if (filters.tfgTitle) query.tfgTitle = { $regex: filters.tfgTitle, $options: "i" };
        if (filters.keywords) query.keywords = { $in: filters.keywords.split(",") };
        if (filters.advisor) query.advisor = filters.advisor;
        if (filters.abstract) query.abstract = { $regex: filters.abstract, $options: "i" };
        query.verified = true;
        console.log("Query generada:", query);

        const page = parseInt(page_number, 10) || 1;
        const tfgs = await tfgsModel.find(query, 'year degree student tfgTitle keywords advisor abstract').skip((page - 1) * 10).limit(10);

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
        // Verificar que la solicitud es de tipo JSON
        if (!req.is('application/json')) {
            return res.status(400).json({ message: "Se debe enviar una solicitud con formato JSON" });
        }

        // Asegurarse de que req.body contiene los datos
        let body = req.body;

        // Verificar que el campo 'data' está presente y es un JSON válido
        if (body.data) {
            try {
                body = JSON.parse(body.data); // Si 'data' es un string JSON, parsearlo
            } catch (error) {
                return res.status(400).json({ message: 'El campo "data" no contiene JSON válido' });
            }
        }

        // Inicializar el link como "undefined"
        body.link = "undefined";

        // **Manejo de keywords**
        if (typeof body.keywords === 'string') {
            body.keywords = body.keywords.split(",").map(kw => kw.trim());
        } else if (Array.isArray(body.keywords)) {
            // No hacer nada si ya es un array
        } else {
            body.keywords = []; // Si no es un array ni string, inicializar como array vacío
        }

        // Imprimir los datos para revisar
        console.log(body);

        // Crear el nuevo TFG
        const data = await tfgsModel.create(body);
        res.status(201).json(data);

    } catch (error) {
        console.error("Error en createTFG:", error);
        res.status(500).json({ message: error.message });
    }
};


// Petición PATCH para actualizar un TFG, se actualiza solo los campos que se envíen en el body
// En este caso se actualiza solo los campos que se envíen en el body, por lo que no es necesario enviar todos los campos del TFG
/*const patchTFG = async (req, res) => {
    try {
        const { id } = req.params
        const body = matchedData(req)

        // **Manejo de keywords**
        if (typeof body.keywords === 'string') {
            body.keywords = body.keywords.split(",").map(kw => kw.trim());
        } else if (!Array.isArray(body.keywords)) {
            body.keywords = []; // Si no es un array ni string, inicializar como array vacío
        }

        const tfg = await tfgsModel.findByIdAndUpdate(id, { $set: body }, { new: true })

        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}*/
// Petición PUT para actualizar un TFG
// En este caso se actualiza el TFG completo, por lo que se debe enviar todos los campos del TFG
const putTFG = async (req, res) => {
    try {
        const { id } = req.params
        const { body } = req

        // **Manejo de keywords**
        if (typeof body.keywords === 'string') {
            body.keywords = body.keywords.split(",").map(kw => kw.trim());
        } else if (!Array.isArray(body.keywords)) {
            body.keywords = []; // Si no es un array ni string, inicializar como array vacío
        }

        const tfg = await tfgsModel.findByIdAndUpdate(id, { $set: body }, { new: true })
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
        const { id } = req.params
        const link = { link: "undefined" }
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const pinataResponse = await uploadToPinata(fileBuffer, fileName);
            const ipfsFile = pinataResponse.IpfsHash;
            const ipfs_url = `https://${PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
            link.link = ipfs_url;

            // eliminar el file del body
            delete req.file;

        }

        const tfg = await tfgsModel.findByIdAndUpdate(id, { $set: link }, { new: true })
        res.send(tfg)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const patchVerifiedTFG = async (req, res) => {
    try {
        const { id } = req.params
        const { verified } = req.body
        const tfg = await tfgsModel
            .findByIdAndUpdate(id, { verified }, { new: true })
        res.send(tfg)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getDifferentYears = async (req, res) => {
    try {
        const years = await tfgsModel.distinct("year");
        res.status(200).json(years);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getDifferentDegrees = async (req, res) => {
    try {
        const degrees = await tfgsModel.distinct("degree");
        res.status(200).json(degrees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getTFGs, getTFG, getNextTFGS, createTFG, putTFG, deleteTFG, patchFileTFG, patchVerifiedTFG, getDifferentYears, getDifferentDegrees };