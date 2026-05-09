const jwt = require('jsonwebtoken');
const { Account } = require('../models');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') roles = [roles];

    // ❌ Before: returns an array
    // return [ async (req, res, next) => { ... } ]

    // ✅ After: return the function directly
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({ message: 'Unauthorized' });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const account = await Account.findByPk(decoded.id);

            if (!account) return res.status(401).json({ message: 'Unauthorized' });
            if (roles.length && !roles.includes(account.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = account;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}