const chai = require('chai')
const chaiHttp = require('chai-http')
const models = require('../src/models')
const app = require('../app')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect

let userData = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "b1@gmail.com",
    "password": "pass1word",
    "confirm_password": "pass1word"
}

let user2Data = {
    "first_name": "John2",
    "last_name": "Doe2",
    "email": "b2@gmail.com",
    "password": "pass2word",
    "confirm_password": "pass2word"
}

let user, verifToken, loginToken

describe('Registration', () => {
    
    before(async () => {
        await models.ContractParty.destroy({where: {}})
        await models.User.destroy({where: {}})
        await models.EmailVerificationToken.destroy({where: {}})
    })

    it('User can register', async () => {
        assert.equal(await models.User.count({}), 0)
        return chai.request(app)
            .post('/api/v1/registration/sign-up')
            .send(userData)
            .then(result => {
                expect(result.body).to.not.have.property('password')
                expect(result.body.email_verified).to.be.equal(false)
                expect(result.body.active).to.be.equal(false)
                return Promise.all([
                    models.User.count({}),
                    models.EmailVerificationToken.count({})
                ])        
            }).then(result => {
                assert.equal(result[0], 1)
                assert.equal(result[1], 1)
            })
    })

    it('User can not login before email validation', async () => {
        return chai.request(app)
            .post('/api/v1/auth/login')
            .send({ email: userData.email, password: userData.password })
            .then(response => {
                expect(response).to.have.status(403)
            })
    })

    it('User can not call protected route before email validation', async () => {
        chai.request(app)
            .get('/api/v1/system/ping')
            .then(response => {
                expect(response).to.have.status(403)
                assert.equal(response.body.message, 'No token in headers')
            })
    })

    it('User can validate his email address', async () => {
        return models.User.findOne({ where: {'email': userData.email}}).then((user) => {
            assert.equal(user.email_verified, false)
            assert.equal(user.active, false)
        }).then(() => {
            return models.EmailVerificationToken.findOne({ where: {'email': userData.email}})
        }).then(emvtToken => {
            return chai.request(app)
                .get('/api/v1/registration/email-verification')
                .query({token: emvtToken.token})
                .then(response => {
                    assert.equal(response.body.user.email_verified, true)
                    assert.equal(response.body.user.active, true)
                    loginToken = response.body.token
                    expect(loginToken.length).to.be.at.least(100)
                })        
        }).then(() => {
            return models.User.findOne({where: {'email': userData.email}})
        }).then(user => {
            assert.equal(user.email_verified, true)
            assert.equal(user.active, true)
        })
    })

    it('User1 can call protected route after email validation', async () => {
        return chai.request(app)
            .get('/api/v1/system/ping')
            .set('x-access-token', loginToken)
            .then(response => {
                expect(response).to.have.status(200)
                expect(response.body).to.have.property('version')
            })
    })

    describe('Email checker', () => {
        it('We can check if email exists in database before registration', async() => {
            let user = await models.User.create(user2Data)
            return chai.request(app)
                .post('/api/v1/registration/email-exists')
                .send({ email: user.email })
                .then(response => {
                    expect(response).to.have.status(200)
                    assert.equal(response.body.email, user.email)
                    assert.equal(response.body.exists, true)
                })
        })
    
        it('Email format is not required for email checker', async() => {
            return chai.request(app)
            .post('/api/v1/registration/email-exists')
            .send({ email: 'XX' })
            .then(response => {
                expect(response).to.have.status(200)
                assert.equal(response.body.email, 'XX')
                assert.equal(response.body.exists, false)
            })
        })

        it('Non existent email will return false', async() => {
            return chai.request(app)
                .post('/api/v1/registration/email-exists')
                .send({ email: 'non-existent@bla.com' })
                .then(response => {
                    expect(response).to.have.status(200)
                    assert.equal(response.body.email, 'non-existent@bla.com')
                    assert.equal(response.body.exists, false)
                })
        })
    })
    
})