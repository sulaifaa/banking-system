const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account_type: { type: String, enum: ['savings', 'current'], required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['active', 'frozen', 'suspended'], default: 'active' },
  daily_limit: { type: Number, default: 100000 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', AccountSchema);