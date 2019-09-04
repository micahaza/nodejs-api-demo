const express = require('express')
const router = express.Router()

router.use('/registration', require('./registration'))
router.use('/auth', require('./auth'))
router.use('/system', require('./system'))
router.use('/contracts', require('./contract'))

module.exports = router