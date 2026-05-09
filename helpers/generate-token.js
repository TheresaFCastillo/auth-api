const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

function generateJwtToken(account) {
    return jwt.sign(
        { sub: account.id, id: account.id, role: account.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
}

async function generateRefreshToken(account, ipAddress) {
    const token = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshToken = await RefreshToken.create({
        AccountId: account.id,
        token,
        expires,
        createdByIp: ipAddress
    });

    return refreshToken;
}

module.exports = { generateJwtToken, generateRefreshToken };