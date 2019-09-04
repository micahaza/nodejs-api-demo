'use strict'
const jwt = require('jsonwebtoken')

function generateToken(user) {
    return jwt.sign({
        user_id: user.id,
        email: user.email
    }, process.env.SESSION_SECRET)
}

module.exports = {
    generateToken
}