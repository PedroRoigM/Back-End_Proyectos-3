const fetch = require('node-fetch');
const config = require('../config');

// Función para subir archivo a SharePoint usando la API REST
const uploadFileToSharePoint = async (file, token) => {
    try {
        // URL base de SharePoint y nombre del archivo
        const siteUrl = config.SHAREPOINT_URL;  // URL de tu sitio de SharePoint
        const fileName = file.originalname;     // Usar `originalname` para obtener el nombre del archivo

        // URL para la API REST de SharePoint para subir el archivo
        const uploadUrl = `${siteUrl}/_api/web/getfolderbyserverrelativeurl('Shared Documents')/files/add(url='${fileName}',overwrite=true)`;

        // Hacer la solicitud POST para subir el archivo
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,  // Usamos el token de acceso
                'Accept': 'application/json;odata=verbose',  // Indicar que esperamos respuesta en formato JSON
                'Content-Type': 'application/octet-stream',  // Indicamos que es un archivo binario
            },
            body: file.buffer,  // El contenido del archivo (el buffer del archivo)
        });

        // Verificar si la respuesta fue exitosa
        if (response.ok) {
            const responseData = await response.json();
            console.log("Archivo subido con éxito:", responseData.d.ServerRelativeUrl);
            return responseData.d.ServerRelativeUrl;  // Retorna la URL del archivo subido
        } else {
            console.error("Error al subir el archivo:", response.statusText);
            throw new Error(`Error en la subida: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Excepción en la subida a SharePoint:", error);
        throw error;
    }
};

module.exports = uploadFileToSharePoint;
