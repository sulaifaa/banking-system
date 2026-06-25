const Account = require('../models/Account');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const { logAction } = require('../services/auditLog');
const mongoose = require('mongoose');

// Make a payment (customer)
const makePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { account_id, merchant, amount, category = 'other' } = req.body;
    const user = req.user;
    
    // Validation
    if (!account_id || !merchant || !amount || amount <= 0) {
      throw new Error('Invalid payment details');
    }
    
    const account = await Account.findById(account_id).session(session);
    if (!account) throw new Error('Account not found');
    if (account.user_id.toString() !== user._id.toString()) throw new Error('Not your account');
    if (account.status !== 'active') throw new Error('Account frozen');
    if (account.balance < amount) throw new Error('Insufficient balance');
    
    // Deduct balance
    account.balance -= amount;
    await account.save({ session });
    
    // Create payment record
    const payment = await Payment.create([{
      account_id,
      merchant,
      amount,
      category,
      status: 'completed'
    }], { session });
    
    // Create a transaction record for audit
    const transaction = await Transaction.create([{
      from_account: account_id,
      to_account: account_id,
      amount,
      type: 'payment',
      channel: 'app',
      location: req.location || 'Unknown',
      status: 'success',
      fraud_flags: []
    }], { session });
    
    await logAction({
      userId: user._id,
      action: 'MAKE_PAYMENT',
      entity: 'payments',
      details: { merchant, amount, category, paymentId: payment[0]._id },
      ip: req.clientIp
    });
    
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: `Payment of ${amount} to ${merchant} successful`,
      payment: payment[0],
      transaction: transaction[0],
      new_balance: account.balance
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Payment error:', err.message);
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  } finally {
    session.endSession();
  }
};

// Get payment history (customer)
const getPaymentHistory = async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.user._id });
    const accountIds = accounts.map(a => a._id);
    
    const payments = await Payment.find({ account_id: { $in: accountIds } })
      .sort({ timestamp: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payment history:', err.message);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// Get spending by category (customer analytics)
const getSpendingByCategory = async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.user._id });
    const accountIds = accounts.map(a => a._id);
    
    const spending = await Payment.aggregate([
      { $match: { account_id: { $in: accountIds }, status: 'completed' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    res.json(spending);
  } catch (err) {
    console.error('Error fetching spending data:', err.message);
    res.status(500).json({ message: 'Failed to fetch spending data' });
  }
};

module.exports = { makePayment, getPaymentHistory, getSpendingByCategory };