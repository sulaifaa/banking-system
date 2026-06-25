const mongoose = require('mongoose');

const RiskProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  risk_score: { type: Number, default: 0 },
  risk_level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskProfile', RiskProfileSchema);