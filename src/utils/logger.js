'use strict'
const winston = require('winston')
require('winston-daily-rotate-file')

var logRotateTransport = new (winston.transports.DailyRotateFile)({
    dirname: 'logs',
    filename: 'justcontracts-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack
        })
    }
    return info
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        errorStackFormat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `[${info.timestamp}] [${info.level}]: ${info.message}`+(info.stack!==undefined?`${info.stack}`:" "))
    ),
    transports: [
        logRotateTransport
    ]
})

// if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test') {
if (process.env.NODE_ENV == 'development') {
        logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}
 
module.exports = logger