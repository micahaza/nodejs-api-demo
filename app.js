const express = require('express')
const bodyParser = require('body-parser')
const dotenvObj = require('dotenv').config()
const logger = require("./src/utils/logger")

const app = express()
app.use(express.json())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ extended: false }))


// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Cache-Control, Accept, x-access-token, client-time"
    )
    res.header("Access-Control-Allow-Methods", 'OPTIONS, GET, POST, PUT, DELETE, PATCH')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    } else {
        next()
    }
})

app.use('/api/v1', require('./src/controllers'))

app.use(function(err, req, res, next) {
    logger.error(err)
    res.status(err.status || 500)
        .send({
            status: err.status || 500, 
            message: err.message,
            code: err.code || 'ERROR'
        })
})

app.listen(3000, () => logger.info("Listening on port 3000"))

module.exports = app
