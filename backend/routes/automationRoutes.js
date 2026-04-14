const express = require('express');
const automationController = require('../controllers/automationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Create Automation
router.post('/', automationController.createAutomation);

// Get Automations
router.get('/', automationController.getAutomations);

// Trigger Automation (Execute & Send Messages)
router.post('/:automationId/trigger', automationController.triggerAutomation);

// Update Automation
router.put('/:automationId', automationController.updateAutomation);

// Delete Single Automation
router.delete('/:automationId', automationController.deleteAutomation);

// Delete Multiple Automations
router.post('/delete/multiple', automationController.deleteMultipleAutomations);

// Send Follow-up
router.post('/followup/send', automationController.sendFollowUp);

module.exports = router;
