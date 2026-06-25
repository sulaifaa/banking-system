const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);