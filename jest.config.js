module.exports = {
    testEnvironment: 'node',
    setupFiles: ['dotenv/config'], // Para cargar variables de entorno
    testTimeout: 30000, // Aumentar el timeout a 30 segundos
    verbose: true,
    collectCoverageFrom: [
        'models/**/*.js',
        'services/**/*.js',
        'controllers/**/*.js'
    ]
};