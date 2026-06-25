const FraudRule = require('../models/FraudRule');
const RiskProfile = require('../models/RiskProfile');
const { logAction } = require('../services/auditLog');

const getFraudRules = async (req, res) => {
  try {
    const rules = await FraudRule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addFraudRule = async (req, res) => {
  try {
    const { rule_name, condition_type, threshold_value, time_window_minutes, severity, is_active } = req.body;
    const rule = await FraudRule.create({ 
      rule_name, 
      condition_type, 
      threshold_value, 
      time_window_minutes, 
      severity, 
      is_active 
    });
    await logAction({ 
      employeeId: req.employee._id, 
      action: 'ADD_FRAUD_RULE', 
      entity: 'fraud_rules', 
      details: { rule_name }, 
      ip: req.clientIp 
    });
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateFraudRule = async (req, res) => {
  try {
    const rule = await FraudRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    await logAction({ 
      employeeId: req.employee._id, 
      action: 'UPDATE_FRAUD_RULE', 
      entity: 'fraud_rules', 
      details: { ruleId: req.params.id }, 
      ip: req.clientIp 
    });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteFraudRule = async (req, res) => {
  try {
    const rule = await FraudRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    await logAction({ 
      employeeId: req.employee._id, 
      action: 'DELETE_FRAUD_RULE', 
      entity: 'fraud_rules', 
      details: { ruleId: req.params.id, rule_name: rule.rule_name }, 
      ip: req.clientIp 
    });
    res.json({ message: 'Fraud rule deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRiskProfiles = async (req, res) => {
  try {
    const profiles = await RiskProfile.find().populate('user_id', 'full_name email');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRiskScoreManually = async (req, res) => {
  try {
    const { userId, newScore } = req.body;
    let profile = await RiskProfile.findOne({ user_id: userId });
    if (!profile) profile = new RiskProfile({ user_id: userId });
    profile.risk_score = newScore;
    profile.risk_level = newScore < 30 ? 'low' : (newScore < 70 ? 'medium' : 'high');
    profile.last_updated = new Date();
    await profile.save();
    await logAction({ 
      employeeId: req.employee._id, 
      action: 'MANUAL_RISK_UPDATE', 
      entity: 'risk_profiles', 
      details: { userId, newScore, newLevel: profile.risk_level }, 
      ip: req.clientIp 
    });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRiskProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await RiskProfile.findOne({ user_id: userId }).populate('user_id', 'full_name email');
    if (!profile) return res.status(404).json({ message: 'Risk profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getFraudRules, 
  addFraudRule, 
  updateFraudRule, 
  deleteFraudRule,
  getRiskProfiles, 
  updateRiskScoreManually,
  getRiskProfileByUser
};