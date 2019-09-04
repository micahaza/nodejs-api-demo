'use strict'

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(50)
        },
        last_name: {
            type: DataTypes.STRING(50)
        },
        title: {
            type: DataTypes.STRING(10)
        },
        date_of_birth: {
            type: DataTypes.DATEONLY
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password: {
            type: DataTypes.STRING(60)
        },
        reg_date: {
            type: DataTypes.DATEONLY
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        tableName: 'users'
    })
    
    User.associate = function(models) {
        User.belongsToMany(models.Team, {through: 'TeamUser', foreignKey : 'userId'})
        User.belongsToMany(models.Contract, {
            as: 'contracts',
            through: 'contract_parties', 
            foreignKey: 'userId'
        })
    }
    return User
}