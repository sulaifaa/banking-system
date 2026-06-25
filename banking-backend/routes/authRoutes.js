const express = require('express');
const { 
  register, 
  login, 
  verifyOtpAndCompleteLogin, 
  employeeLogin, 
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyResetOtp
} = require('../controllers/authController');
const captureInfo = require('../middleware/captureInfo');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', captureInfo, register);
router.post('/login', captureInfo, login);
router.post('/verify-otp', verifyOtpAndCompleteLogin);
router.post('/employee-login', captureInfo, employeeLogin);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/verify-reset-otp', verifyResetOtp);

module.exports = router;