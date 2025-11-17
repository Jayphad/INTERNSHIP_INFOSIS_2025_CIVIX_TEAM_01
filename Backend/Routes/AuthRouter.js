const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, login,forgotPassword, resetPassword } = require('../Controller/AuthController');
const { signupValidation, loginValidation } = require('../Middleware/validation');

// Step 1: Send OTP to email during signup
router.post('/send-otp', signupValidation, sendOTP);

// Step 2: Verify OTP and complete registration
router.post('/verify-otp', verifyOTP);

// Step 3: Login route (same as before)
router.post('/login', loginValidation, login);

// -------------------- 🔑 Forgot Password Section --------------------
// Step 4: Forgot Password - send reset link
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);



module.exports = router;
