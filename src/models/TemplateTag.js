'use strict'

module.exports = (sequelize, DataTypes) => {
    const TemplateTag = sequelize.define('TemplateTag', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
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
          version: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          name: {
              type: DataTypes.STRING
          },
          value: {
            type: DataTypes.STRING
          },
          createdAt: DataTypes.DATE,
          updatedAt: DataTypes.DATE
    }, {
        tableName: 'template_tags'
    })
    
    TemplateTag.associate = function(models) {
      // associations can be defined here
    }
    return TemplateTag
}