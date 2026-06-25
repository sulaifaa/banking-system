const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp_code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'verified', 'expired'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true }
});

module.exports = mongoose.model('OTPVerification', OTPSchema);