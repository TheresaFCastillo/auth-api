const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts.controller');
const authorize = require('../middleware/authorize');

// Public routes
router.post('/register', accountController.register);
router.post('/verify-email', accountController.verifyEmail);
router.post('/authenticate', accountController.authenticate);
router.post('/refresh-token', accountController.refreshToken);
router.post('/revoke-token', authorize(), accountController.revokeToken);
router.post('/forgot-password', accountController.forgotPassword);
router.post('/validate-reset-token', accountController.validateResetToken);
router.post('/reset-password', accountController.resetPassword);

// Protected routes (Admin only)
router.post('/', authorize('Admin'), accountController.create);
router.get('/', authorize('Admin'), accountController.getAll);
router.delete('/:id', authorize('Admin'), accountController.delete);

// Protected routes (any logged-in user)
router.get('/:id', authorize(), accountController.getById);
router.put('/:id', authorize(), accountController.update);

module.exports = router;