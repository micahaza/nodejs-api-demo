'use strict'

var express = require('express')
var router = express.Router()
var controller = require('./controller')

router.post('/sign-up', controller.singUp)
router.post('/email-exists', controller.emailExists)
router.get('/email-verification', controller.emailVerification)

module.exports = router