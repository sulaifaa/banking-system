const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['teller', 'fraud_analyst', 'admin', 'auditor'], required: true },
  access_level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Employee', EmployeeSchema);