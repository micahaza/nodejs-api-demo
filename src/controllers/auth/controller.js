'use strict'
const Joi = require('joi')
const async = require('async')
const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const tokenUtils = require('../../utils/token')
const logger = require('../../utils/logger')
const models = require('../../models')

function login(req, res, next) {

    const tasks = [
        function validateInput(cb) {
            const schema = {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            }
            const {error} = Joi.validate(req.body, schema)
            if(error) {
                cb(error)
            } else {
                cb(null)
            }
        },
        function checkIfUserExists(cb) {
            models.User.findOne({
                where: {
                    email: req.body.email
                }
            }).then(user => {
                if(user) {
                    cb(null, user)
                } else {
                    let err = new Error('User not found')
                    err.status = 403
                    err.code = 'USER_DOES_NOT_EXISTS'
                    cb(err)
                }
                
            })
        },
        function isEmailVerified(user, cb) {
            if(user.email_verified == true) {
                cb(null, user)
            } else {
                let e = new Error("User email is not verified")
                e.status = 403
                e.code = 'EMAIL_IS_NOT_VERIFIED'
                e.message = 'Please verify your email first. Verification email sent'
                cb(e)
            }
        },
        function checkPassword(user, cb) {
            let isValidPassword = bcrypt.compareSync(req.body.password, user.password)
            if(isValidPassword) {
                cb(null, user)
            } else {
                cb(new Error('User password not valid'))
            }
        },
        function sendToken(user, cb) {
            const token = tokenUtils.generateToken(user)
            delete user.dataValues.password
            cb(null, {user: user, token: token})
        }
    ]

    async.waterfall(tasks, function(err, results) {
        if (err) {
            logger.error(err)
            next(err)
        } else {
            res.status(201).json(results)
        }
    })
}

function passwordResetRequest(req, res, next) {

    let usr 

    const tasks = [
        function validateInput(cb) {
            const schema = {
                email: Joi.string().email().required()
            }
            const {error} = Joi.validate(req.body, schema)
            if(error) {
                cb(error)
            } else {
                cb(null)
            }
        },
        function userExists(cb) {
            models.User.findOne({where: { email: req.body.email}})
            .then(user => {
                if(!user) {
                    cb(new Error('User not found'))
                } else {
                    usr = user
                    cb(null, user)
                }
            })
        },
        function createPasswordResetToken(user, cb) {
            let token = jwt.sign({
                user_id: user.id,
                email: user.email
            }, process.env.SESSION_SECRET)

            models.PasswordResetToken.create({userId: user.id, token: token}).then(pwrt => {
                cb(null, token)
            })
        },
        function dropEmail(token, cb) {
            cb(null, token)
        }
    ]
    async.waterfall(tasks, function(err, results) {
        if (err) {
            logger.error(err)
            next(err)
        } else {
            res.status(201).json(results)
        }
    })
}

function passwordReset(req, res, next) {
    // TODO: fixme
    
    let token, user
    
    const tasks = [
        function validateInput(cb) {
            console.log(req.query)
            const schema = {
                token: Joi.string().min(100).required()
            }
            const {error} = Joi.validate(req.query, schema)
            if(error) {
                cb(error)
            } else {
                cb(null)
            }
        },
        function findToken(cb) {
            // TODO fix me
            models.PasswordResetToken.findOne({where: {token: req.query.token}}).then(tk => {
                token = tk
                u = tk.getUser()
                console.log("-------------")
                console.log(JSON.stringify(tk))
                
                return u
            }).then(u => {
                console.log("-------------")
                console.log(JSON.stringify(u))
                console.log("-------------")
            })
            cb(null)
        },
        function resetPassword(cb) {
            cb(null)
        },
        function removeToken(cb) {

        },
        function dropEmail(cb) {
            // TODO: fixme
        }
    ]
    
    async.waterfall(tasks, function(err, results) {
        if (err) {
            logger.error(err)
            next(err)
        } else {
            res.status(201).json(results)
        }
    })
}

module.exports = {
    login,
    passwordResetRequest,
    passwordReset
}