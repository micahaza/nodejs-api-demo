'use strict'
const async = require('async')
const jwt = require('jsonwebtoken')
const logger = require('./logger')
const models = require('../models')
const Op = require('sequelize').Op

/**
 * Check if x-access token is valid for a request
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isAuthenticated(req, res, next) {
    const tasks = [
        function headerHasToken(cb) {
            const token = req.headers['x-access-token']
            if(token) {
                cb(null, token)
            } else {
                let e = new Error("No token in headers")
                e.code = 422
                cb(e)
            }
        },
        function verifyAndDecodeToken(token, cb) {
            jwt.verify(token, process.env.SESSION_SECRET, function (err, decodedToken) {
                if(err) {
                    let e = new Error("Token is invalid or expired")
                    e.code = 422
                    cb(e)
                }
                else {
                    cb(null, decodedToken)
                }
            })
        },
        function userExistsAndActive(decodedToken, cb) {
            models.User.count({
                where: {
                    id: decodedToken.user_id,
                    email: decodedToken.email,
                    email_verified: true,
                    active: true
                }
            }).then(count => {
                if(count == 1) {
                    cb(null, decodedToken)
                } else {
                    let e = new Error('Access denied')
                    cb(e)
                }
            })
        }
    ]

    async.waterfall(tasks, function(err, decodedToken) {
        if (err) {
            err.status = 403
            err.code = 403
            next(err)
        } else {
            req.token = decodedToken
            next()
        }
    })
}

/**
 * Checks if a single contract is accessible for a single user
 * TODO: fixme
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function isMyContract(req, res, next) {
    
    let contract = await models.sequelize.query(`SELECT c.id, c.name FROM contracts c
        LEFT JOIN contract_parties cp ON c.id = cp.contractId
        WHERE c.id = :contractId AND (c.ownerId = :ownerId OR cp.userId = :ownerId)`, {
            replacements: {
                contractId: req.params.contract_id, 
                ownerId: req.token.user_id
            },
            type: models.sequelize.QueryTypes.SELECT,
        }
    ).catch(err => {
        console.log(err)
    })

    if(!contract[0]) {
        let error = new Error('Access denied')
        error.code = 403
        error.status = 403
        next(error)
    } else {
        next()
    }
}

module.exports = {
    isAuthenticated,
    isMyContract
}