/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
const { matchedData } = require('express-validator')
const { tfgsModel, yearsModel, degreesModel } = require('../models')
const multer = require("multer");
const uploadToPinata = require("../utils/UploadToPinata");
const { handleHttpError } = require("../utils/handleError");
const GetFilePinata = require("../utils/GetFilePinata")
const handlePdfToImg = require("../utils/handlePdfToImg")
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL

const existsyear = async (year) => {
    const search = await yearsModel.find({ year: year });
    if (search.length == 0) {
        return false
    }
    return true
}
const existsdegree = async (degree) => {
    const search = await degreesModel.find({ degree: degree })
    if (search.length == 0) {
        return false
    }
    return true
}
const getTFGsNames = async (req, res) => {
    try {
        const tfgs = await tfgsModel.find().select("_id, tfgTitle")
        return res.status(200).json(tfgs)
    } catch (err) {
        handleHttpError(res, "ERROR_GETTING_TFGS_NAMES")
    }
}
// Petición GET para obtener todos los tfgs
// Se obtiene una lista de todos los TFGs que hay en la base de datos
const getTFGs = async (req, res) => {
    try {
        const tfgs = await tfgsModel.find()
        res.status(200).json(tfgs)
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_TFGS")
    }
}
// Petición GET para obtener un TFG por su id
// Se obtiene un TFG por su id, debe ser un ID de mongoDB
const getTFG = async (req, res) => {
    try {
        const { id } = req.params
        const tfg = await tfgsModel.findOne({ _id: id, verified: true }).select("_id year degree student tfgTitle keywords advisor abstract")
        if (!tfg) {
            return res.status(404).json({ message: "TFG not found or not verified" });
        }
        res.send(tfg)
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_TFG")
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

        if (filters.advisor) query.advisor = filters.advisor;
        if (filters.search) {
            const searchRegex = { $regex: filters.search, $options: "i" };
            query.$or = [
                { student: searchRegex },
                { tfgTitle: searchRegex },
                { keywords: { $in: filters.search.split(" ") } },
                { abstract: searchRegex }
            ];
        }
        query.verified = true;

        const page = parseInt(page_number, 10) || 1;
        const tfgs = await tfgsModel.find(query, 'year degree student tfgTitle keywords advisor abstract').skip((page - 1) * 10).limit(10);

        res.status(200).json(tfgs);
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_TFGS")
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

        if (! await existsyear(req.body.year)) {
            return res.status(400).json({ message: "El curso academico no es válido." })
        }

        if (! await existsdegree(req.body.degree)) {
            return res.status(400).json({ message: "El grado académico no es válido." })
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
        // Crear el nuevo TFG
        const data = await tfgsModel.create(body);
        res.status(201).json(data);

    } catch (error) {
        handleHttpError(res, "ERROR_CREATING_TFGS")
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
        if (!existsyear(req.body.year)) {
            return res.status(400).json({ message: "El curso academico no es valido." })
        }
        if (!existsdegree(req.body.degree)) {
            return res.status(400).json({ message: "El grado académico no es válido." })
        }
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
        handleHttpError(res, "ERROR_UPDATING_TFG")
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
        handleHttpError(res, "ERROR_DELETING_TFG")
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
        handleHttpError(res, "ERROR_UPDATING_TFG_FILE")
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
        handleHttpError(res, "ERROR_VERIFYING_TFG")
    }
}
const getFileTFG = async (req, res) => {
    try {
        const { id } = req.params;
        const tfg = await tfgsModel.findById(id);
        if (!tfg) {
            return res.status(404).json({ message: "TFG not found" });
        }
        // Petición a PINATA para obtener el archivo
        const fileBuffer = await GetFilePinata(tfg.link);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="tfg_${id}.pdf"`); // Opcional: Forzar descarga

        res.send(Buffer.from(fileBuffer)); // Convertir ArrayBuffer a Buffer
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GETTING_TFG_FILE");
    }
};
// TODO: getFilePhotosTFG (funcion para obtener las fotos de un TFG, de esta manera será más seguro para que los usuarios no puedan descargar los archivos)
// ? Funcionalidad parecida a getFileTFG pero para las fotos de los TFGs, hay que transformar los pdf a imágenes y enviarlas al frontend
// ? Se utiliza la función handlePdfToImg para convertir el pdf a imágenes
// ? Se debe enviar un array de imágenes al frontend
const getFilePhotosTFG = async (req, res) => {
    try {
        const { id } = req.params;
        const tfg = await tfgsModel.findById(id);
        if (!tfg) {
            return res.status(404).json({ message: "TFG not found" });
        }

        // Petición a PINATA para obtener el archivo
        const fileBuffer = await GetFilePinata(tfg.link);

        // Convertir el pdf a imágenes
        const images = await handlePdfToImg(fileBuffer);

        res.status(200).json(images);
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GETTING_TFG_PHOTOS");
    }
};
module.exports = { getTFGs, getTFG, getTFGsNames, getNextTFGS, createTFG, putTFG, deleteTFG, patchFileTFG, patchVerifiedTFG, getFileTFG, getFilePhotosTFG };