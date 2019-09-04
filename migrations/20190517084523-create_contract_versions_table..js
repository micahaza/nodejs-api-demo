'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("contract_versions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
          type: Sequelize.STRING
      },
      ownerId: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      description: {
          type: Sequelize.STRING
      },
      legal_text: {
          type: Sequelize.TEXT
      },
      effective_date: {
          type: Sequelize.DATEONLY
      },
      expiration_date: {
          type: Sequelize.DATEONLY
      },
      auto_renews: {
          type: Sequelize.BOOLEAN
      },
      currency: {
          type: Sequelize.STRING(3)
      },
      amount: {
          type: Sequelize.FLOAT(10,2)
      },
      status: {
          type: Sequelize.STRING(30)
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("contract_versions")
  }
}