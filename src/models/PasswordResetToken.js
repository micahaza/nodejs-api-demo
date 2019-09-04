'use strict'

module.exports = (sequelize, DataTypes) => {
    const PasswordResetToken = sequelize.define('PasswordResetToken', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        tableName: 'password_reset_tokens'
    })
    
    PasswordResetToken.associate = function(models) {
        PasswordResetToken.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
    }
    return PasswordResetToken
}