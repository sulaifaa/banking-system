const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { logAction } = require('../services/auditLog');

const getBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.accountId, user_id: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ balance: account.balance, currency: account.currency });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { amount } = req.body;
    const account = await Account.findById(req.params.accountId).session(session);
    
    if (!account) throw new Error('Account not found');
    if (account.user_id.toString() !== req.user._id.toString()) throw new Error('Not your account');
    if (account.status !== 'active') throw new Error('Account frozen');
    
    // Update balance
    account.balance += amount;
    await account.save({ session });
    
    // Create transaction record for deposit
    const transaction = await Transaction.create([{
      from_account: account._id,
      to_account: account._id,
      amount,
      type: 'deposit',
      channel: 'app',
      location: req.location || 'Unknown',
      status: 'success',
      fraud_flags: []
    }], { session });
    
    await logAction({
      userId: req.user._id,
      action: 'DEPOSIT',
      entity: 'accounts',
      details: { accountId: account._id, amount },
      ip: req.clientIp
    });
    
    await session.commitTransaction();
    
    res.json({ 
      message: `Deposited ${amount} successfully`, 
      new_balance: account.balance,
      transaction: transaction[0]
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { amount } = req.body;
    const account = await Account.findById(req.params.accountId).session(session);
    
    if (!account) throw new Error('Account not found');
    if (account.user_id.toString() !== req.user._id.toString()) throw new Error('Not your account');
    if (account.status !== 'active') throw new Error('Account frozen');
    if (account.balance < amount) throw new Error('Insufficient balance');
    
    // Update balance
    account.balance -= amount;
    await account.save({ session });
    
    // Create transaction record for withdrawal
    const transaction = await Transaction.create([{
      from_account: account._id,
      to_account: account._id,
      amount,
      type: 'withdrawal',
      channel: 'app',
      location: req.location || 'Unknown',
      status: 'success',
      fraud_flags: []
    }], { session });
    
    await logAction({
      userId: req.user._id,
      action: 'WITHDRAW',
      entity: 'accounts',
      details: { accountId: account._id, amount },
      ip: req.clientIp
    });
    
    await session.commitTransaction();
    
    res.json({ 
      message: `Withdrew ${amount} successfully`, 
      new_balance: account.balance,
      transaction: transaction[0]
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

module.exports = { getBalance, deposit, withdraw };