/**
 * Validador personalizado para correos electrónicos de U-tad
 * Verifica que el correo cumpla con el formato: nombre.apellido@u-tad.com o nombre.apellido@live.u-tad.com
 * También acepta nombre.apellidoNumero@u-tad.com o nombre.apellidoNumero@live.u-tad.com
 * 
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidUtadEmail = (email) => {
    if (!email) return false;

    // Patrón que verifica:
    // 1. nombre.apellido o nombre.apellidoNumero antes del @
    // 2. Dominios permitidos: u-tad.com o live.u-tad.com
    const emailPattern = /^[a-z]+\.[a-z]+(\d+)?@(u-tad\.com|live\.u-tad\.com)$/i;

    return emailPattern.test(email);
};

module.exports = { isValidUtadEmail };