const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (to, otp, purpose = 'login') => {
  let subject = '';
  let message = '';
  
  switch(purpose) {
    case 'login':
      subject = 'COMET Bank - Login Verification OTP';
      message = `Your login OTP is ${otp}. Valid for 5 minutes.\n\nIf you didn't request this, please ignore this email.`;
      break;
    case 'beneficiary':
      subject = 'COMET Bank - Add Beneficiary Verification OTP';
      message = `Your OTP to add a new beneficiary is ${otp}. Valid for 5 minutes.\n\nThis is to verify your identity before adding a new trusted contact.`;
      break;
    case 'password_reset':
      subject = 'COMET Bank - Password Reset OTP';
      message = `Your password reset OTP is ${otp}. Valid for 5 minutes.\n\nIf you didn't request a password reset, please contact support immediately.`;
      break;
    default:
      subject = 'COMET Bank - Verification OTP';
      message = `Your OTP is ${otp}. Valid for 5 minutes.`;
  }
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message
  });
};

module.exports = { sendOTPEmail };