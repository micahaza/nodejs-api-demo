'use strict'

function ping(req, res, next) {
    let version = require('../../../package.json').version
    return res.status(200).send({version: version})
}

module.exports = {
    ping
}