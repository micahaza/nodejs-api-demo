const bcrypt = require('bcrypt-nodejs')

var now = new Date()

let user1Data = {
    "first_name": "John1",
    "last_name": "Doe1",
    "email": "b2@gmail.com",
    "password": bcrypt.hashSync('pass1word', bcrypt.genSaltSync(8), null),
    "email_verified": true,
    "active": true
}

let user2Data = {
    "first_name": "John2",
    "last_name": "Doe2",
    "email": "b3@gmail.com",
    "password": bcrypt.hashSync('pass1word', bcrypt.genSaltSync(8), null),
    "email_verified": true,
    "active": true
}

let user3Data = {
    "first_name": "John3",
    "last_name": "Doe3",
    "email": "b4@gmail.com",
    "password": bcrypt.hashSync('pass1word', bcrypt.genSaltSync(8), null),
    "email_verified": true,
    "active": true
}

let contract1Data = {
    name: "JC Contract name",
    description: "First ever template for testing to be saved ..... ",
    legal_text: `MUTUAL NON-DISCLOSURE AGREEMENT
    This Mutual Non-Disclosure Agreement (hereinafter: “this Agreement”) is made and entered into on this day of {{contract_signaturedate}}

    BY AND BETWEEN:
    {{party1_fullname}}, {{party1_nationality}}, {{party1_IDcard}} on behalf of {{party1_companyname}} of {{party1_fulladdress}} here referred to as “Party One”, and {{party2_fullname}}, {{party2_nationality}}, {{party2_IDcard}} on behalf of {{party1_companyname}} of {{party2_fulladdress}} here referred to “Party Two”.

    “Party One” and “Party Two” shall hereinafter individually be referred to as a “Party” and collectively as the “Parties”. .......`,
    template_tags: {
        party1_first_name: 'Johan',
        party1_last_name: 'Zammit',
        party1_nationality: 'Malteese',
        party1_email: 'bajgli+1@gmail.com',
        party1_IDcard: 'BAA3455-GA2',
        party1_company_name: 'SmartStudios Limited',
        party1_fulladdress: 'Birkirkara, Malta',
        party2_first_name: 'Zoltán',
        party2_last_name: 'Pető',
        party2_email: 'bajgli+2@gmail.com',
        party2_nationality: 'Hungarian',
        party2_IDcard: 'CA44335GJ',
        party2_company_name: 'Blockspire Limited',
        party2_fulladdress: 'Naxxar, Malta'
    },
    parties: [
        {first_name: "Johan", last_name: "Zammit", email: "test1@gmail.com" },
        {first_name: "Zoltán", last_name: "Pető", email: "test2@gmail.com" }
    ],
    effective_date: now,
    expiration_date: now.setDate(now.getDate() + 30),
    auto_renews: false,
    contract_type: 'Generic',
    send_alert_in_days: 23,
    currency: 'EUR',
    amount: 2400
}

module.exports = {
    user1Data,
    user2Data,
    user3Data,
    contract1Data
}