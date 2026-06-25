const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  from_account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  to_account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'loan_repayment', 'loan_disbursement'], 
    required: true 
  },
  channel: { type: String, enum: ['app', 'web', 'card', 'employee'], default: 'app' },
  location: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'flagged'], default: 'pending' },
  risk_score: { type: Number, default: 0 },
  fraud_flags: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);