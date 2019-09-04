'use strict'

var express = require('express')
var router = express.Router()
var controller = require('./controller')
const middleware = require('../../utils/middleware')

router.get('/ping',  middleware.isAuthenticated, controller.ping)

module.exports = router