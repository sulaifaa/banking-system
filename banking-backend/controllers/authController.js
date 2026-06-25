const mongoose = require('mongoose');
const OTPVerification = require('../models/OTPVerification'); // Add this import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Account = require('../models/Account');
const LoginSession = require('../models/LoginSession');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { logAction } = require('../services/auditLog');
const { updateRiskScore } = require('../services/riskScore');

const register = async (req, res) => {
  try {
    const { full_name, email, phone, cnic, password, address } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { cnic }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      full_name, email, phone, cnic, password_hash, address,
      kyc_status: 'verified',
      status: 'active'
    });
    
    await Account.create({ user_id: user._id, account_type: 'savings', balance: 0 });
    await logAction({ userId: user._id, action: 'REGISTER', entity: 'users', details: { email }, ip: req.clientIp });
    res.status(201).json({ message: 'User registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      user.failed_login_attempts += 1;
      if (user.failed_login_attempts >= 5) {
        user.status = 'locked';
        user.locked_until = new Date(Date.now() + 30 * 60000);
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const device = req.deviceInfo;
    const ip = req.clientIp;
    
    let risk = 0;
    if (!user.known_devices.includes(device)) risk += 25;
    if (!user.known_ips.includes(ip)) risk += 20;
    if (user.failed_login_attempts >= 3) risk += 40;
    
    await updateRiskScore(user._id, risk);
    
    user.failed_login_attempts = 0;
    await user.save();
    
    if (!user.known_devices.includes(device)) user.known_devices.push(device);
    if (!user.known_ips.includes(ip)) user.known_ips.push(ip);
    await user.save();
    
    let otpRequired = (risk >= 25);
    if (otpRequired) await sendOTP(user._id, user.email, 'login');  // ← UPDATED
    
    const session = await LoginSession.create({
      user_id: user._id,
      role: 'customer',
      ip_address: ip,
      device_info: device,
      location: req.location,
      status: 'active'
    });
    
    const token = jwt.sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });


    await logAction({ userId: user._id, action: 'LOGIN_SUCCESS', entity: 'users', ip });
    
    res.json({ 
      token, 
      sessionId: session._id, 
      userId: user._id,
      otpRequired, 
      otpSent: otpRequired, 
      message: otpRequired ? 'OTP sent' : 'Login OK' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyOtpAndCompleteLogin = async (req, res) => {
  try {
    const { userId, otp, sessionId } = req.body;
    const isValid = await verifyOTP(userId, otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid/expired OTP' });
    const session = await LoginSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const token = jwt.sign({ id: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, employee.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: employee._id, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    await LoginSession.create({
      employee_id: employee._id,
      role: 'employee',
      ip_address: req.clientIp,
      device_info: req.deviceInfo,
      status: 'active'
    });
    res.json({ token, role: employee.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userId, email, purpose } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email required' });
    }
    
    await sendOTP(userId, email, purpose || 'login');
    
    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: err.message });
  }
};
// Forgot password - send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    // Send OTP with purpose 'password_reset'
    await sendOTP(user._id, user.email, 'password_reset');
    
    res.json({ 
      message: 'OTP sent to your email for password reset',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password with OTP
// Reset password with OTP (does NOT verify OTP again, assumes already verified)
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    
    // Check if OTP was verified (look for verified record)
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const otpRecord = await OTPVerification.findOne({
      user_id: userIdObj,
      otp_code: otp,
      status: 'verified',
      expires_at: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not verified or expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await User.findByIdAndUpdate(userId, { password_hash });
    
    // Mark OTP as used
    otpRecord.status = 'expired';
    await otpRecord.save();
    
    // Invalidate all sessions for this user
    await LoginSession.updateMany(
      { user_id: userId, status: 'active' },
      { status: 'expired' }
    );
    
    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Change password (logged in user)
// Change password (logged in user)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('Change password request for user:', req.user._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      console.log('Current password incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password length
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password_hash = password_hash;
    await user.save();
    
    console.log('Password changed successfully for user:', req.user._id);
    
    await logAction({
      userId: req.user._id,
      action: 'CHANGE_PASSWORD',
      entity: 'users',
      ip: req.clientIp
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: err.message });
  }
};
// Verify reset OTP only (without resetting password)
const verifyResetOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const isValid = await verifyOTP(userId, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { 
  register, 
  login, 
  verifyOtpAndCompleteLogin, 
  employeeLogin, 
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyResetOtp
};