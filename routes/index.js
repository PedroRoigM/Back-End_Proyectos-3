/**
 * Router principal que carga automáticamente todas las rutas
 * @module routes/index
 */
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

/**
 * Extrae el nombre base del archivo sin extensión
 * @param {string} fileName - Nombre del archivo con extensión
 * @returns {string} Nombre del archivo sin extensión
 */
const removeExtension = (fileName) => {
    return fileName.split('.').shift();
};

// Carga automática de rutas desde archivos en el directorio actual
fs.readdirSync(__dirname)
    .filter((file) => {
        // Ignorar archivos que empiezan con '.' o '_' y el archivo index.js
        return !file.startsWith('.') &&
            !file.startsWith('_') &&
            file !== 'index.js' &&
            file.endsWith('.js');
    })
    .forEach((file) => {
        const routeName = removeExtension(file);
        const routePath = path.join(__dirname, file);

        // Registrar ruta con el prefijo correspondiente al nombre del archivo
        router.use(`/${routeName}`, require(routePath));

        console.log(`Ruta cargada: /${routeName}`);
    });

module.exports = router;