'use strict'

const models = require('../../models')
const Joi = require('joi')
const async = require('async')
const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const tokenUtils = require('../../utils/token')

function singUp(req, res, next) {
    
    let newUser

    const tasks = [
        function validateInput(cb) {
            const schema = {
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
                confirm_password: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
            }
            const {error} = Joi.validate(req.body, schema)
            if(error) {
                cb(error)
            } else {
                cb(null)
            }
        },
        function userExists(cb) {
            models.User.count({where: { email: req.body.email}})
            .then(cnt => {
                if(cnt > 0) {
                    cb(new Error('Email already exists'))
                } else {
                    cb(null)
                }
            })
        },
        function createUser(cb) {
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null)
            models.User.create(req.body).then(user => {
                newUser = user
                cb(null, newUser)   
            })
        },
        function createEmailVerificationToken(newUser, cb) {
            let token = jwt.sign({
                user_id: newUser.id,
                email: newUser.email
            }, process.env.SESSION_SECRET)

            models.EmailVerificationToken.create({email: newUser.email, token: token})
                .then(newToken => {
                    cb(null, newToken)
                }).catch(err => {
                    cb(err)
                })
        },
        function sendWelcomeEmail(newToken, cb) {
            // emailSender.sendWelcomeEmail(newUserObj.dataValues, newToken.token)
            cb(null, newUser)
        } 
    ]

    async.waterfall(tasks, function(err, newUser) {
        if (err) {
            next(err)
        } else {
            delete newUser.dataValues.password
            res.status(201).json(newUser.dataValues)
        }
    })
}

async function emailExists(req, res, next) {
    let count = await models.User.count({where: { email: req.body.email}})
    if(count > 0) {
        res.status(200).json({email: req.body.email, exists: true})
    } else {
        res.status(200).json({email: req.body.email, exists: false})
    }
}

function emailVerification(req, res, next) {

    let user

    const tasks = [
        function checkIfTokenExists(cb) {
            models.EmailVerificationToken.findOne({
                where: {
                    token: req.query.token
                  }
            }).then(emToken => {
                if(emToken != null) {
                    cb(null, emToken)
                } else {
                    let e = new Error("Token not found or expired")
                    e.status = e.code = 422
                    cb(e)
                }
            })
        },
        function updateUser(token, cb) {
            models.User.findOne({
                where: { email: token.dataValues.email }}
            ).then(user => {
                return user.update({
                    active: true,
                    email_verified: true
                })
            }).then(upd => {
                user = upd
                cb(null, upd)
            }).catch(err => {
                cb(err)
            })
        },
        function removeToken(token, cb) {
            models.EmailVerificationToken.destroy({
                where: {
                  token: req.query.token
                }
            }).then(affRows => {
                cb(null)
            })
        },
        function directLogin(cb) {
            const token = tokenUtils.generateToken(user.dataValues)
            try {
                user.password = undefined
                cb(null, {user: user, token: token})           
            } catch (error) {
                cb(error)                
            }
        }
    ]

    async.waterfall(tasks, function(err, results) {
        if (err) {
            next(err)
        } else {
            res.status(201).send(results)
        }
    })
}

module.exports = {
    singUp,
    emailExists,
    emailVerification
}