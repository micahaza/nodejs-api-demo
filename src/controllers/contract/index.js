'use strict'

var express = require('express')
var router = express.Router()
var controller = require('./controller')
const auth = require('../../utils/middleware')

router.post('/', auth.isAuthenticated, controller.createContract)
router.get('/:contract_id', [auth.isAuthenticated, auth.isMyContract], controller.getContract)
router.get('/', auth.isAuthenticated, controller.listContracts)
router.put('/:contract_id', [auth.isAuthenticated, auth.isMyContract], controller.updateContract)
router.post('/:contract_id', [auth.isAuthenticated, auth.isMyContract], controller.shareContract)

module.exports = router