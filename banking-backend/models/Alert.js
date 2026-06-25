const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fraud_type: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  reason: { type: String },
  status: { type: String, enum: ['open', 'resolved', 'rejected'], default: 'open' },
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  resolution_note: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);