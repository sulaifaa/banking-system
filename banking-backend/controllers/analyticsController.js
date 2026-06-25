const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const RiskProfile = require('../models/RiskProfile');
const User = require('../models/User');

const fraudByCategory = async (req, res) => {
  const alerts = await Alert.aggregate([
    { $group: { _id: '$fraud_type', count: { $sum: 1 } } }
  ]);
  res.json(alerts);
};

const transactionsOverTime = async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const data = await Transaction.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(data);
};

const riskDistribution = async (req, res) => {
  const distribution = await RiskProfile.aggregate([
    { $group: { _id: '$risk_level', count: { $sum: 1 } } }
  ]);
  res.json(distribution);
};

const topRiskyUsers = async (req, res) => {
  const risky = await RiskProfile.find().sort({ risk_score: -1 }).limit(10).populate('user_id', 'full_name email');
  res.json(risky);
};

const transactionVolumeReport = async (req, res) => {
  const total = await Transaction.countDocuments();
  const flagged = await Transaction.countDocuments({ status: 'flagged' });
  const failed = await Transaction.countDocuments({ status: 'failed' });
  res.json({ total, flagged, failed });
};

module.exports = { fraudByCategory, transactionsOverTime, riskDistribution, topRiskyUsers, transactionVolumeReport };