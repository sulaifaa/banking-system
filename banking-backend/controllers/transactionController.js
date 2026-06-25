const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Beneficiary = require('../models/Beneficiary');
const { evaluateTransaction } = require('../services/fraudEngine');
const { logAction } = require('../services/auditLog');
const LoginSession = require('../models/LoginSession');
const mongoose = require('mongoose');

// Helper function to get today's date in PKT (Asia/Karachi)
const getTodayPKT = () => {
  const now = new Date();
  const pktTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const today = new Date(pktTime);
  today.setHours(0, 0, 0, 0);
  return today;
};

const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { from_account_id, to_account_id, amount, channel = 'app' } = req.body;
    const user = req.user;
    
    const fromAccount = await Account.findById(from_account_id).session(session);
    const toAccount = await Account.findById(to_account_id).session(session);
    if (!fromAccount || !toAccount) throw new Error('Account not found');
    if (fromAccount.user_id.toString() !== user._id.toString()) throw new Error('Not your account');
    if (fromAccount.status !== 'active') throw new Error('Account frozen');
    if (fromAccount.balance < amount) throw new Error('Insufficient balance');
    
    const isBeneficiary = await Beneficiary.findOne({ 
      user_id: user._id, 
      account_number: to_account_id 
    });
    const blockLimit = isBeneficiary ? 500000 : 200000;
    if (amount > blockLimit) {
      return res.status(403).json({ 
        message: `Per transaction limit exceeded. Maximum ${blockLimit} per transfer.`,
        blockLimit: blockLimit,
        requestedAmount: amount
      });
    }
    const dailyLimit = isBeneficiary ? 1000000 : 200000;
    const today = getTodayPKT();
    
    const todaysTransfers = await Transaction.aggregate([
      {
        $match: {
          from_account: from_account_id,
          timestamp: { $gte: today },
          status: 'success'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalToday = todaysTransfers[0]?.total || 0;
    if (totalToday + amount > dailyLimit) {
      return res.status(403).json({ 
        message: `Daily limit exceeded. You have used ${totalToday} of ${dailyLimit} today.`,
        dailyLimit: dailyLimit,
        usedToday: totalToday,
        remainingToday: dailyLimit - totalToday,
        requestedAmount: amount
      });
    }
    
    const loginSession = await LoginSession.findOne({ user_id: user._id, status: 'active' }).sort({ login_time: -1 });
    const fraudResult = await evaluateTransaction({
      from_account: from_account_id,
      to_account: to_account_id,
      amount,
      location: req.location,
      user_id: user._id
    }, user, loginSession);
    
    if (fraudResult.status === 'failed') {
      await Transaction.create([{
        from_account: from_account_id,
        to_account: to_account_id,
        amount,
        type: 'transfer',
        channel,
        location: req.location,
        status: 'failed',
        risk_score: fraudResult.risk_score,
        fraud_flags: fraudResult.flags
      }], { session });
      await session.abortTransaction();
      return res.status(403).json({ message: 'Transaction blocked by fraud system', flags: fraudResult.flags });
    }
    
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save({ session });
    await toAccount.save({ session });
    
    const transaction = await Transaction.create([{
      from_account: from_account_id,
      to_account: to_account_id,
      amount,
      type: 'transfer',
      channel,
      location: req.location,
      status: fraudResult.status === 'flagged' ? 'flagged' : 'success',
      risk_score: fraudResult.risk_score,
      fraud_flags: fraudResult.flags
    }], { session });
    
    await logAction({ userId: user._id, action: 'TRANSFER', entity: 'transactions', details: { amount, to: to_account_id }, ip: req.clientIp });
    await session.commitTransaction();
    
    // Generate specific flag message
    let flagReason = '';
    if (fraudResult.flags.includes('HIGH_AMOUNT')) flagReason = 'high amount';
    else if (fraudResult.flags.includes('HIGH_VELOCITY')) flagReason = 'unusual activity (multiple transactions in short time)';
    else if (fraudResult.flags.includes('LOCATION_MISMATCH')) flagReason = 'location mismatch';
    else if (fraudResult.flags.includes('NEW_RECIPIENT')) flagReason = 'first-time recipient';
    
    const responseMessage = fraudResult.status === 'flagged' 
      ? `Transaction flagged due to ${flagReason} and requires employee review` 
      : 'Transfer successful';
    
    res.json({ 
      message: responseMessage, 
      transaction: transaction[0],
      isBeneficiary: isBeneficiary ? true : false,
      riskScore: fraudResult.risk_score,
      flags: fraudResult.flags,
      limits: {
        blockLimit: blockLimit,
        dailyLimit: dailyLimit,
        usedToday: totalToday + amount,
        remainingDaily: dailyLimit - (totalToday + amount)
      }
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const getTransactionHistory = async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ from_account: { $in: await Account.find({ user_id: req.user._id }).distinct('_id') } },
          { to_account: { $in: await Account.find({ user_id: req.user._id }).distinct('_id') } }]
  }).sort({ timestamp: -1 });
  res.json(transactions);
};

module.exports = { transfer, getTransactionHistory };