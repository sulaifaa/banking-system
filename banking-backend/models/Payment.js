const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['utility', 'shopping', 'food', 'transport', 'mobile', 'education', 'other'], default: 'other' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);