module.exports = (err, req, res, next) => {
    console.error('ERROR:', err);

    if (typeof err === 'string') {
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(500).json({ message: err.message || 'Internal Server Error' });
};