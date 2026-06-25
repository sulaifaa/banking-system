const mongoose = require('mongoose');
const OTPVerification = require('../models/OTPVerification');
const { sendOTPEmail } = require('./emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (userId, email, purpose = 'login') => {
  // Invalidate old OTPs
  await OTPVerification.updateMany({ user_id: userId, status: 'pending' }, { status: 'expired' });
  const otp = generateOTP();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);
  await OTPVerification.create({ user_id: userId, otp_code: otp, expires_at });
  await sendOTPEmail(email, otp, purpose);
  return otp;
};

const verifyOTP = async (userId, otpCode) => {
  console.log('Verifying - userId:', userId);
  console.log('Verifying - otpCode:', otpCode);
  
  // Convert to ObjectId if it's a string
  const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  
  const record = await OTPVerification.findOne({
    user_id: userIdObj,
    otp_code: otpCode,
    status: 'pending',
    expires_at: { $gt: new Date() }
  });
  
  console.log('Found record:', record);
  
  if (!record) return false;
  if (record.attempts >= 3) {
    record.status = 'expired';
    await record.save();
    return false;
  }
  record.attempts += 1;
  if (record.attempts > 3) {
    record.status = 'expired';
    await record.save();
    return false;
  }
  if (record.otp_code === otpCode) {
    record.status = 'verified';
    await record.save();
    return true;
  }
  await record.save();
  return false;
};

module.exports = { sendOTP, verifyOTP };