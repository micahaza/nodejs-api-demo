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

describe('Contract Visibility', () => {

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

    describe('Listing', () => {
        it('User1 can see contract in the list as he is the owner', async () => {
            
            let contract = await models.Contract.create({
                name: 'c1', 
                version: 1, 
                ownerId: user1.id, 
                status: 'DRAFT'
            })
            
            let party1 = await models.ContractParty.create({
                contractId: contract.id,
                userId: user2.id,
                version: 1
            })
    
            return chai.request(app)
                .get('/api/v1/contracts/?page=1&pageSize=5')
                .set('x-access-token', loginToken1)
                .then(res => {
                    expect(res).to.have.status(200)
                    expect(res.body).to.have.property('data')
                    expect(res.body).to.have.property('total')
                    expect(res.body).to.have.property('pageSize')
                    expect(res.body).to.have.property('page')
                    expect(res.body.data).to.be.an.instanceof(Array)
                    assert.equal(res.body.total, 1)
                    assert.equal(res.body.page, 1)
                    assert.equal(res.body.pageSize, 5)
                })
        })
        
        it('User2 can see the contract as he is a party', async() => {
            return chai.request(app)
            .get('/api/v1/contracts/?page=1&pageSize=5')
            .set('x-access-token', loginToken2)
            .then(res => {
                // console.log(res.body)
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('data')
                expect(res.body).to.have.property('total')
                expect(res.body).to.have.property('pageSize')
                expect(res.body).to.have.property('page')
                expect(res.body.data).to.be.an.instanceof(Array)
                assert.equal(res.body.total, 1)
                assert.equal(res.body.page, 1)
                assert.equal(res.body.pageSize, 5)
            })
        })
    
        it('User3 can not see the contract as he is not the owner nor on the party list', async() => {
            let contract = await models.Contract.create({
                name: 'c1', 
                version: 1, 
                ownerId: user2.id, 
                status: 'DRAFT'
            })
            
            await models.ContractParty.create({
                contractId: contract.id,
                userId: user2.id,
                version: 1
            })
            
            await models.ContractParty.create({
                contractId: contract.id,
                userId: user1.id,
                version: 1
            })
            
            return chai.request(app)
            .get('/api/v1/contracts/?page=1&pageSize=5')
            .set('x-access-token', loginToken3)
            .then(res => {
                // console.log(res.body)
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('data')
                expect(res.body).to.have.property('total')
                expect(res.body).to.have.property('pageSize')
                expect(res.body).to.have.property('page')
                expect(res.body.data).to.be.an.instanceof(Array)
                assert.equal(res.body.total, 0)
                assert.equal(res.body.page, 1)
                assert.equal(res.body.pageSize, 5)
            })
        })    
    })

    describe('One contract', async () => {

        let contract, party1

        it('User1 can see contract as he is the owner', async () => {
            contract = await models.Contract.create({
                name: 'c1', 
                version: 1, 
                ownerId: user1.id, 
                status: 'DRAFT'
            })
            
            party1 = await models.ContractParty.create({
                contractId: contract.id,
                userId: user2.id,
                version: 1
            })
    
            return chai.request(app)
            .get('/api/v1/contracts/' + contract.id)
            .set('x-access-token', loginToken1)
            .then(res => {
                expect(res).to.have.status(200)
                expect(res.body.id).to.be.equal(contract.id)
            })
        })
        
        it('User2 can see the contract as he is a party', async() => {
            return chai.request(app)
            .get('/api/v1/contracts/' + contract.id)
            .set('x-access-token', loginToken2)
            .then(res => {
                expect(res).to.have.status(200)
                expect(res.body.id).to.be.equal(contract.id)
            })
        })
    
        it('User3 can not see the contract as he is not the owner nor on the party list', async() => {
            return chai.request(app)
            .get('/api/v1/contracts/' + contract.id)
            .set('x-access-token', loginToken3)
            .then(res => {
                expect(res).to.have.status(403)
                expect(res.body.message).to.be.equal('Access denied')
                expect(res.body.status).to.be.equal(403)
            })
        })    
    })


})
