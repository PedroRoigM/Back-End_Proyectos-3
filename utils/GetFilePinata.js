const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;

const GetFilePinata = async (url_file) => {
    const response = await fetch(url_file, {
        method: 'GET',
        headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey
        }
    });

    if (!response.ok) {
        throw new Error(`Error al obtener el archivo: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.arrayBuffer(); // Usar arrayBuffer en lugar de text()
    }
};

module.exports = GetFilePinata;
