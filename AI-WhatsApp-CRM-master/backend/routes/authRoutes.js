const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Developer Login
router.post('/developer-login', authController.developerLogin);

// Developer Register
router.post('/developer-register', authController.developerRegister);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Get Current User
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
