'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      first_name: {
          type: Sequelize.STRING(50)
      },
      last_name: {
          type: Sequelize.STRING(50)
      },
      title: {
          type: Sequelize.STRING(10)
      },
      date_of_birth: {
          type: Sequelize.DATEONLY
      },
      email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
      },
      email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      is_admin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      password: {
          type: Sequelize.STRING(60)
      },
      reg_date: {
          type: Sequelize.DATEONLY
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users")
  }
}