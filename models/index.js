const db = require('../config/database');
const Account = require('./account.model');
const RefreshToken = require('./refresh-token.model');

// Relationships
Account.hasMany(RefreshToken, { onDelete: 'CASCADE' });
RefreshToken.belongsTo(Account);

module.exports = {
    db,
    Account,
    RefreshToken
};