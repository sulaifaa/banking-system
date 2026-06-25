const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  card_number_masked: { type: String, required: true },
  expiry: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'inactive' },
  daily_limit: { type: Number, default: 100000 },
  used_today: { type: Number, default: 0 }
});

module.exports = mongoose.model('Card', CardSchema);