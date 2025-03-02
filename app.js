require('dotenv').config();
const express = require("express")
const cors = require("cors")
const dbConnect = require("./config/mongo")
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');

const app = express()
const swaggerDocument = yaml.parse(fs.readFileSync('./swagger.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//Le decimos a la app de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 3000
app.use("/api", require("./routes")) //Lee routes/index.js por defecto

app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port)
    dbConnect()
})