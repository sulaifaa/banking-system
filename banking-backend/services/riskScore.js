const RiskProfile = require('../models/RiskProfile');

const updateRiskScore = async (userId, additionalRisk) => {
  let profile = await RiskProfile.findOne({ user_id: userId });
  if (!profile) {
    profile = new RiskProfile({ user_id: userId, risk_score: 0 });
  }
  let newScore = profile.risk_score + additionalRisk;
  if (newScore < 0) newScore = 0;
  if (newScore > 100) newScore = 100;
  profile.risk_score = newScore;
  if (newScore < 30) profile.risk_level = 'low';
  else if (newScore < 70) profile.risk_level = 'medium';
  else profile.risk_level = 'high';
  profile.last_updated = new Date();
  await profile.save();
  return profile;
};

module.exports = { updateRiskScore };