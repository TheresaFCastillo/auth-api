const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Account = db.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('Admin', 'User'),
        allowNull: false,
        defaultValue: 'User'
    },
    verificationToken: {
        type: DataTypes.STRING
    },
    verified: {
        type: DataTypes.DATE
    },
    resetToken: {
        type: DataTypes.STRING
    },
    resetTokenExpires: {
        type: DataTypes.DATE
    },
    passwordReset: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true
});

module.exports = Account;