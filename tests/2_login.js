const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const chaiHttp = require('chai-http')
const bcrypt = require('bcrypt-nodejs')
const app = require('../app')
const tokenUtils = require('../src/utils/token')
const models = require('../src/models')
chai.use(chaiHttp)

let userData = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "b1@gmail.com",
    "password": bcrypt.hashSync('pass1word', bcrypt.genSaltSync(8), null)
}

let loginToken

describe('Login', () => {

    before(async () => {
        await models.User.destroy({where: {}})
        // await models.EmailVerificationToken.destroy({where: {}})
        testUser = await models.User.create(userData)
        loginToken = tokenUtils.generateToken(testUser)
    })

    it('Login with non-existent email results in error', () => {
        return chai.request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'fake@email.com', password: 'wrongPass' })
            .then(response => {
                expect(response).to.have.status(403)
                expect(response.body.status).to.be.equal(403)
                expect(response.body.code).to.be.equal('USER_DOES_NOT_EXISTS')
            })
    })

    it('Correct email+pass can not log in if email is not verified', async () => {
        return chai.request(app)
            .post('/api/v1/auth/login')
            .send({ email: userData.email, password: userData.password })
            .then(response => {
                expect(response).to.have.status(403)
                expect(response.body.status).to.be.equal(403)
                expect(response.body.code).to.be.equal('EMAIL_IS_NOT_VERIFIED')
            })
    })


    it('User can log in if email is verified and is active', async () => {
        let user2 = await models.User.findByPk(testUser.id)
        user2.email_verified = true
        user2.active = true
        await user2.save()

        return chai.request(app)
            .post('/api/v1/auth/login')
                .send({ email: userData.email, password: 'pass1word' })
                .then(response => {
                    expect(response).to.have.status(201)
                    expect(response.body).to.have.property('user')
                    expect(response.body).to.have.property('token')
                })
    })

    it('logged in user can call protected endpoint ', async() => {
        return chai.request(app)
            .get('/api/v1/system/ping')
            .set('x-access-token', loginToken)
            .then(response => {
                expect(response).to.have.status(200)
                expect(response.body).to.have.property('version')
            })
    })
})