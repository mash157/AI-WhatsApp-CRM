const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Get User Profile
router.get('/profile', userController.getUserProfile);

// Update User Profile
router.put('/profile', userController.updateUserProfile);

// Get Usage Stats
router.get('/usage', userController.getUsageStats);

// Get Trial Status
router.get('/trial', userController.getTrialStatus);

// Connect WhatsApp
router.post('/whatsapp/connect', userController.connectWhatsApp);

// Get Customers
router.get('/customers', userController.getCustomers);

// Add Customer
router.post('/customers/add', userController.addCustomer);

// Delete Single Customer
router.delete('/customers/:customerId', userController.deleteCustomer);

// Delete Multiple Customers
router.post('/customers/delete/multiple', userController.deleteMultipleCustomers);

module.exports = router;
