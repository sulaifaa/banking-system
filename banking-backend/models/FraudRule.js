const mongoose = require('mongoose');

const FraudRuleSchema = new mongoose.Schema({
  rule_name: { type: String, required: true },
  condition_type: { type: String, enum: ['amount', 'velocity', 'location', 'new_beneficiary'], required: true },
  threshold_value: { type: Number }, // for amount or velocity
  time_window_minutes: { type: Number }, // for velocity
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('FraudRule', FraudRuleSchema);