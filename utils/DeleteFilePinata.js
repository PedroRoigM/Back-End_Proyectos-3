const pinataApiKey = process.env.PINATA_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET;

const DeleteFilePinata = async (url_file) => {
    try {
        if (!url_file) throw new Error("La URL del archivo es inválida o está vacía.");

        // Extraer el CID desde la URL del archivo
        const cidMatch = url_file.match(/ipfs\/(.+)$/);
        if (!cidMatch) throw new Error("No se encontró un CID válido en la URL.");

        const cid = cidMatch[1];

        console.log(pinataApiKey)
        console.log(pinataSecretApiKey)
        // Llamar al endpoint correcto de Pinata
        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar el archivo de Pinata: ${response.status} - ${errorText}`);
        }

        console.log(`Archivo con CID ${cid} eliminado correctamente de Pinata.`);
        return true;
    } catch (error) {
        console.error("Error en DeleteFilePinata:", error.message);
        throw error;
    }
};

module.exports = DeleteFilePinata;
