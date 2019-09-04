'use strict'

module.exports = (sequelize, DataTypes) => {
    const EmailVerificationToken = sequelize.define('EmailVerificationToken', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        token: {
            type: DataTypes.STRING
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        tableName: 'email_verification_tokens'
    })
    
    EmailVerificationToken.associate = function(models) {
      // associations can be defined here
    }
    return EmailVerificationToken
}