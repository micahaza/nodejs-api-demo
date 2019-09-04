const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const chaiHttp = require('chai-http')
const app = require('../app')
const tokenUtils = require('../src/utils/token')
const models = require('../src/models')
const common = require('./common')

chai.use(chaiHttp)

let loginToken1, loginToken2, user1, user2, contractId1, contractId2

describe('Contract', () => {

    before(async () => {
        await models.ContractParty.destroy({where: {}})
        await models.TemplateTag.destroy({where: {}})
        await models.Contract.destroy({where: {}})
        await models.User.destroy({where: {}})
        
        user1 = await models.User.create(common.user1Data)
        loginToken1 = tokenUtils.generateToken(user1)
        user2 = await models.User.create(common.user2Data)
        loginToken2 = tokenUtils.generateToken(user2)
        user3 = await models.User.create(common.user3Data)
        loginToken3 = tokenUtils.generateToken(user3)
        
    })

    it('User1 can create a contract', () => {
        return chai.request(app)
            .post('/api/v1/contracts')
            .set('x-access-token', loginToken1)
            .send(common.contract1Data)
            .then(res => {
                expect(res.body).to.be.an('object')
                expect(res).to.have.status(201)
                expect(res).to.have.status(201)
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
                assert.equal(res.body.name, common.contract1Data.name)
                assert.equal(res.body.description, common.contract1Data.description)
                assert.equal(res.body.version, 1)
                assert.equal(res.body.status, 'DRAFT')
                contractId1 = res.body.id
            })
    })

    it('User1 can load his contract', async () => {
        return chai.request(app)
            .get('/api/v1/contracts/' +  contractId1)
            .set('x-access-token', loginToken1)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
                assert.equal(res.body.name, common.contract1Data.name)
                assert.equal(res.body.description, common.contract1Data.description)
                assert.equal(res.body.version, 1)
                assert.equal(res.body.parties[0].email_verified, false)
                assert.equal(res.body.parties[1].email_verified, false)
                assert.equal(res.body.parties[0].active, false)
                assert.equal(res.body.parties[1].active, false)
                assert.equal(res.body.owner.email, user1.email)
                assert.equal(res.body.owner.id, user1.id)
                assert.equal(res.body.tts[0].value, common.contract1Data.template_tags[res.body.tts[0].name])
            })
    })

    it('User1 can list contracts. Results are paginated', async () => {
        common.contract1Data.version = 1
        common.contract1Data.ownerId = user1.id

        let contracts = await models.Contract.bulkCreate([
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data,
            common.contract1Data
        ]).catch(err => {
            console.log(err)
        })
        
        assert.equal(await models.Contract.count({}), 17)
        
        return chai.request(app)
            .get('/api/v1/contracts/?page=3&pageSize=5')
            .set('x-access-token', loginToken1)
            .then(res => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('data')
                expect(res.body).to.have.property('total')
                expect(res.body).to.have.property('pageSize')
                expect(res.body).to.have.property('page')
                expect(res.body.data).to.be.an.instanceof(Array)
                assert.equal(res.body.total, 17)
                assert.equal(res.body.page, 3)
                assert.equal(res.body.pageSize, 5)
                assert.equal(res.body.data.length, 5)
                assert.equal(res.body.data[0].id, contracts[8].id)   
            })
    })

    it('If an email is already in our database, we won\'t create new user for it', async () => {
        let cData = {
            status: 'DRAFT',
            version: 1,
            name: 'Contract name',
            legal_text: 'legal bla bla',
            parties: [
                // {first_name: user2.first_name, last_name: user2.last_name, email: user2.email},
                {first_name: "Zoltán13", last_name: "Pető13", email: "test202@gmail.com" }
            ],
            template_tags: {
                bla: 'blo',
                ble: 'jop'
            }
            
        }

        return chai.request(app)
            .post('/api/v1/contracts')
            .set('x-access-token', loginToken1)
            .send(cData)
            .then(res => {
                console.log(res.body)
                // expect(res.body).to.be.an('object')
                // expect(res).to.have.status(201)
                // expect(res).to.have.status(201)
                // expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
                // assert.equal(res.body.name, common.contract1Data.name)
                // assert.equal(res.body.description, common.contract1Data.description)
                // assert.equal(res.body.version, 1)
                // assert.equal(res.body.status, 'DRAFT')
                // contractId1 = res.body.id
            })
    })

    it.skip('User1 can update a contract', async () => {
        common.contract1Data.ownerId = user1.id
        common.contract1Data.status = 'DRAFT'
        let contract = await models.Contract.create(common.contract1Data)
        
        await models.ContractParty.create({
            contractId: contract.id,
            userId: user2.id,
            version: 1
        })
        
        await models.ContractParty.create({
            contractId: contract.id,
            userId: user3.id,
            version: 1
        })
        
        // return chai.request(app)
        //     .get('/api/v1/contracts/' +  contractId1)
        //     .set('x-access-token', loginToken1)
        //     .then((res) => {
        //         // console.log(res.body)
        //     })

        let update = {}
        
        return chai.request(app)
            .post('/api/v1/contracts/' +  contractId1)
            .set('x-access-token', loginToken1)
            .send(update)
            .then((res) => {
                console.log(res.body)
            })
    })
    
    it.skip('User1 can share a contract with one person', async () => {

    })

    it.skip('User2 can see shared contract', async () => {

    })

    it.skip('User2 can modify shared contract', async () => {

    })

    it.skip('User2 can send back contract for review', async () => {

    })

    it.skip('User1 can view modified contract', async () => {

    })

    it.skip('User1 can accept all changes', async () => {

    })

    it.skip('User1 can sign the contract', async () => {

    })

    it.skip('User2 can countersign the contract', async () => {

    })

    it.skip('Contract is effective now', async () => {

    })
})