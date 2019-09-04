'use strict'

module.exports = (sequelize, DataTypes) => {
    const ContractParty = sequelize.define('ContractParty', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          contractId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
            references: {
              model: 'contracts',
              key: 'id',
            }
          },
          userId: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
            references: {
              model: "users",
              key: 'id',
            }
          },
          version: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          createdAt: DataTypes.DATE,
          updatedAt: DataTypes.DATE
    }, {
        tableName: 'contract_parties'
    })
    
    ContractParty.associate = function(models) {
      
    }
    return ContractParty
}