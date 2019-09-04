'use strict'

const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/login', controller.login)
router.post('/password-reset-request', controller.passwordResetRequest)
router.get('/password-reset', controller.passwordReset)

module.exports = router