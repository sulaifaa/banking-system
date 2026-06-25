const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, default: 'customer' },
  kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['active', 'suspended', 'locked'], default: 'active' },
  failed_login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },
  known_devices: [{ type: String }], 
  known_ips: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);