const mongoose = require('mongoose');

const LoginSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  role: { type: String, enum: ['customer', 'employee'] },
  ip_address: { type: String, required: true },
  device_info: { type: String },
  location: { type: String },
  login_time: { type: Date, default: Date.now },
  logout_time: { type: Date },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  failed_attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model('LoginSession', LoginSessionSchema);