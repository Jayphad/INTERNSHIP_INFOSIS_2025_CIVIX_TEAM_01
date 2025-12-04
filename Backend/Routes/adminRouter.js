const express = require('express');
const router = express.Router();
const { getPendingOfficials, updateOfficialStatus } = require('../Controller/adminController');
const authMiddleware = require('../Middleware/authMiddleware'); // your existing JWT auth

// All routes require Super Admin authentication
router.use(authMiddleware);

// Get all pending officials
router.get('/pending-officials', getPendingOfficials);

// Approve or reject an official
router.post('/update-official', updateOfficialStatus);

module.exports = router;
