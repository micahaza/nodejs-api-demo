'use strict'
const Joi = require('joi')
const async = require('async')
const logger = require('../../utils/logger')
const models = require('../../models')
const Op = models.Sequelize.Op

function createContract(req, res, next) {

    const tasks = [
        function validateInput(cb) {
            const schema = {
                name: Joi.string().min(2).required(),
                description: Joi.string(),
                template_tags: Joi.object(),
                legal_text: Joi.string().required(),
                effective_date: Joi.date(),
                expiration_date:    Joi.date(),
                auto_renews: Joi.boolean(),
                contract_type: Joi.string(),
                risk: Joi.number(),
                send_alert_in_days: Joi.number(),
                currency: Joi.string().min(3).max(3),
                amount: Joi.number(),
                owner: Joi.number(),
                version: Joi.number(),
                parties: Joi.array(),
                renewals: Joi.array(),
                status: Joi.string(),
                created_at: Joi.date(),
                updated_at: Joi.date(),
            }
            const {error} = Joi.validate(req.body, schema)
            if(error) {
                logger.error(error)
                cb(error)
            } else {
                cb(null)
            }
        },
        function saveContract(cb) {
            req.body.ownerId = req.token.user_id
            req.body.version = 1
            req.body.status = 'DRAFT'
            models.Contract.create(req.body).then(contract => {
                cb(null, contract)
            })
        },
        // function checkParties(contract, cb) {
        //     let promises = []
        //     req.body.parties.forEach(partyData => {
        //         promises.push(models.User.findOne({where: {email: partyData.email}}))
        //     })
        //     Promise.all(promises).then(user => {
        //         console.log(JSON.stringify(user))
        //     })
        // },
        function addParties(contract, cb) {
            let promises = []
            req.body.parties.forEach(partyData => {
                promises.push(models.User.create(partyData))
            })
            
            Promise.all(promises).then(parties => {
                promises = []
                parties.forEach(party => {
                    promises.push(models.ContractParty.create({
                        contractId: contract.id,
                        userId: party.id,
                        version: 1
                    }))
                })
            }).catch(err => {
                next(err)
            })
            cb(null, contract)
        },
        function addTemplateTags(contract, cb) {
            let promises = []
            for(var ttName in req.body.template_tags) {
                promises.push(models.TemplateTag.create({
                    contractId: contract.id,
                    version: 1,
                    name: ttName,
                    value: req.body.template_tags[ttName]
                }))
            }
            Promise.all(promises).then(tts => {
                return contract.addTts(tts)
            }).then(res => {
                cb(null, contract)
            }).catch(err => {
                next(err)
            })
        },
        function notifyParties(contract, cb) {
            cb(null, contract)
        }
    ]

    async.waterfall(tasks, function(err, results) {
        if (err) {
            next(err)
        } else {
            return res.status(201).json(results)
        }
    })
}

function updateContract(req, res, next) {

    const tasks = [
        function validateInput(cb) {
            cb(null)
        },
        function saveNewVersion(cb) {
            cb(null)
        },
        function saveParties(cb) {
            cb(null)
        },
        function saveTemplateTags(cb) {
            cb(null)
        },
        function dropEmails(cb) {
            cb(null)
        } 
    ]

    async.waterfall(tasks, function(err, results) {
        if (err) {
            next(err)
        } else {
            return res.status(201).json('results')
        }
    })
}

function shareContract(req, res, next) {

}

async function listContracts(req, res, next) {

    let results = {
        data: [],
        total: 0,
        pageSize: parseInt(req.query.pageSize) || 10,
        page: parseInt(req.query.page) || 0
    }

    let offset = results.pageSize * (results.page - 1)

    let contractsCount = await models.sequelize.query(
        `SELECT COUNT(DISTINCT c.id) AS count FROM contracts c
        LEFT JOIN contract_parties cp ON c.id = cp.contractId
        WHERE c.ownerId = :userId OR cp.userId = :userId`,
        {
            replacements: { userId: req.token.user_id },
            type: models.sequelize.QueryTypes.SELECT,
        }).catch(err => {
            console.log(err)
        })

    let contracts = await models.sequelize.query(`SELECT c.id, c.name FROM contracts c
        LEFT JOIN contract_parties cp ON c.id = cp.contractId
        WHERE c.ownerId = :userId OR cp.userId = :userId
        LIMIT :limit
        OFFSET :offset`, {
            replacements: {
                userId: req.token.user_id, 
                offset: offset,
                limit: results.pageSize
            },
            type: models.sequelize.QueryTypes.SELECT,
        }).catch(err => {
            console.log(err)
        })

    results.total = contractsCount[0] ? contractsCount[0].count : 0
    results.data = contracts
    
    return res.status(200).json(results)
}

/**
 * Returns a single contract.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getContract(req, res, next) {
    let contract = await models.Contract.findByPk(req.params.contract_id, {
        include: [
            {model: models.TemplateTag, as: 'tts'},
            {model: models.User, as: 'owner'},
            {model: models.User, as: 'parties'}
        ]
    })
    return res.status(200).json(contract)
}

async function partyChecker(contract, cb) {
    console.log(JSON.stringify(contract))
    cb(null, contract)
}

module.exports = {
    createContract,
    getContract,
    updateContract,
    shareContract,
    listContracts
}