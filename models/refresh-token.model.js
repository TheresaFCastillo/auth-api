const { DataTypes } = require('sequelize');
const db = require('../config/database');

const RefreshToken = db.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdByIp: {
        type: DataTypes.STRING
    },
    revoked: {
        type: DataTypes.DATE
    },
    revokedByIp: {
        type: DataTypes.STRING
    },
    replacedByToken: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = RefreshToken;