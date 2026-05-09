const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Account, RefreshToken } = require('../models');
const { generateJwtToken, generateRefreshToken } = require('../helpers/generate-token');
const sendEmail = require('../helpers/send-email');

module.exports = {
    register,
    verifyEmail,
    authenticate,
    refreshToken,
    revokeToken,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function register(params, origin) {
    const exists = await Account.findOne({ where: { email: params.email } });

    if (exists) {
        await sendAlreadyRegisteredEmail(params.email, origin);
        return;
    }

    const isFirstAccount = (await Account.count()) === 0;
    const account = new Account();

    account.title = params.title;
    account.firstName = params.firstName;
    account.lastName = params.lastName;
    account.email = params.email;
    account.role = isFirstAccount ? 'Admin' : 'User';
    account.verificationToken = crypto.randomBytes(40).toString('hex');
    account.passwordHash = await bcrypt.hash(params.password, 10);

    await account.save();
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await Account.findOne({ where: { verificationToken: token } });
    if (!account) throw 'Verification failed';

    account.verified = new Date();
    account.verificationToken = null;
    await account.save();
}

async function authenticate({ email, password, ipAddress }) {
    const account = await Account.findOne({ where: { email } });

    if (!account || !account.verified || !await bcrypt.compare(password, account.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(account);
    const refreshTokenRecord = await generateRefreshToken(account, ipAddress);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshTokenRecord.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshTokenRecord = await RefreshToken.findOne({
        where: { token },
        include: [Account]
    });

    if (!refreshTokenRecord || refreshTokenRecord.revoked || new Date() >= refreshTokenRecord.expires) {
        throw 'Invalid token';
    }

    const account = refreshTokenRecord.Account;
    const newRefreshToken = await generateRefreshToken(account, ipAddress);

    refreshTokenRecord.revoked = new Date();
    refreshTokenRecord.revokedByIp = ipAddress;
    refreshTokenRecord.replacedByToken = newRefreshToken.token;
    await refreshTokenRecord.save();

    const jwtToken = generateJwtToken(account);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshTokenRecord = await RefreshToken.findOne({ where: { token } });
    if (!refreshTokenRecord) throw 'Token not found';

    refreshTokenRecord.revoked = new Date();
    refreshTokenRecord.revokedByIp = ipAddress;
    await refreshTokenRecord.save();
}

async function forgotPassword({ email }, origin) {
    const account = await Account.findOne({ where: { email } });
    if (!account) return;

    account.resetToken = crypto.randomBytes(40).toString('hex');
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await account.save();

    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: new Date() }
        }
    });
    if (!account) throw 'Invalid token';
    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    account.passwordHash = await bcrypt.hash(password, 10);
    account.passwordReset = new Date();
    account.resetToken = null;
    account.resetTokenExpires = null;
    await account.save();
}

async function getAll() {
    const accounts = await Account.findAll();
    return accounts.map(basicDetails);
}

async function getById(id) {
    const account = await Account.findByPk(id);
    if (!account) throw 'Account not found';
    return basicDetails(account);
}

async function create(params) {
    if (await Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new Account(params);
    account.verified = new Date();
    account.passwordHash = await bcrypt.hash(params.password, 10);
    await account.save();
    return basicDetails(account);
}

async function update(id, params) {
    const account = await Account.findByPk(id);
    if (!account) throw 'Account not found';

    if (params.email && params.email !== account.email) {
        if (await Account.findOne({ where: { email: params.email } })) {
            throw 'Email "' + params.email + '" is already registered';
        }
    }

    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    Object.assign(account, params);
    account.updatedAt = new Date();
    await account.save();
    return basicDetails(account);
}

async function _delete(id) {
    const account = await Account.findByPk(id);
    if (!account) throw 'Account not found';
    await account.destroy();
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, verified, createdAt } = account;
    return { id, title, firstName, lastName, email, role, verified, createdAt };
}

async function sendVerificationEmail(account, origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification - Verify Email',
        html: `
            <h4>Verify Email</h4>
            <p>Thanks for registering!</p>
            <p>Please click the below link to verify your email address:</p>
            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        `
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    await sendEmail({
        to: email,
        subject: 'Sign-up Verification - Email Already Registered',
        html: `
            <h4>Email Already Registered</h4>
            <p>Your email <strong>${email}</strong> is already registered.</p>
            <p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>
        `
    });
}

async function sendPasswordResetEmail(account, origin) {
    const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification - Reset Password',
        html: `
            <h4>Reset Password Email</h4>
            <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
        `
    });
}