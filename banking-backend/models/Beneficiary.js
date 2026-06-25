const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bank: { type: String, required: true },
  account_number: { type: String, required: true },
  relation: { type: String }
});

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);