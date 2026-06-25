const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  principal: { type: Number, required: true },
  interest_rate: { type: Number, required: true },
  duration_months: { type: Number, required: true },
  remaining_balance: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'paid', 'rejected', 'defaulted'], default: 'pending' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approved_at: { type: Date },
  monthly_installment: { type: Number },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', LoanSchema);