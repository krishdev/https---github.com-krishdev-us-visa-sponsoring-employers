const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

var Employer_Names = sequelize.define('Employer_Names', {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: false,
            allowNull: false,
            field: 'ID',
        },
        Employer_Name: {
            type: DataTypes.STRING(400),
            validate: {
                notEmpty: true,
            },
            allowNull: false,
            field: 'Employer_Name',
        }
    },
    {
    schema: 'dbo',
    timestamps: false,
    freezeTableName: true,
    }
);

module.exports = Employer_Names;