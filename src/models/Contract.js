'use strict'

module.exports = (sequelize, DataTypes) => {
    const Contract = sequelize.define('Contract', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
        legal_text: {
            type: DataTypes.TEXT
        },
        effective_date: {
            type: DataTypes.DATEONLY
        },
        expiration_date: {
            type: DataTypes.DATEONLY
        },
        auto_renews: {
            type: DataTypes.BOOLEAN
        },
        currency: {
            type: DataTypes.STRING(3)
        },
        amount: {
            type: DataTypes.FLOAT(10,2)
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        tableName: 'contracts'
    })
    
    Contract.associate = function(models) {
        Contract.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'})
        Contract.hasMany(models.TemplateTag, {foreignKey: 'contractId', as: 'tts'})
        Contract.belongsToMany(models.User, {
            as: 'parties',
            through: 'contract_parties', 
            foreignKey: 'contractId'
        })
        
    }
    return Contract
}