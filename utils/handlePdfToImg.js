// ? Función que convierte un archivo PDF a una imagen
// ? @param {*} file

const { PDFImage } = require("pdf-image");
const fs = require("fs");
const path = require("path");

const handlePdfToImg = async (file) => {
    let filePath;

    // Si file es un ArrayBuffer, lo convertimos a Buffer antes de escribirlo
    if (file instanceof ArrayBuffer) {
        file = Buffer.from(file);
    }

    // Si file es un Buffer, guardamos el archivo temporalmente
    if (file instanceof Buffer) {
        const tempDir = path.join(__dirname, "..", "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir); // Crear carpeta temp si no existe

        filePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
        fs.writeFileSync(filePath, file);
    } else if (typeof file === "string") {
        filePath = file; // Ya es una ruta válida
    } else {
        throw new Error("Formato de archivo no válido.");
    }

    // Convertimos el PDF a imagen
    const pdfImage = new PDFImage(filePath);
    const img = await pdfImage.convertFile();

    // Movemos la imagen generada a la carpeta final
    const outputPath = path.join(__dirname, "..", "public", "images", path.basename(img));
    fs.renameSync(img, outputPath);

    // Eliminamos el archivo PDF temporal si se creó
    if (filePath.includes("temp-")) {
        fs.unlinkSync(filePath);
    }

    return outputPath;
};
// ? Exporta la función handlePdfToImg
module.exports = handlePdfToImg