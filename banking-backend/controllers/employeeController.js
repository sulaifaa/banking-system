const User = require('../models/User');
const Account = require('../models/Account');
const CardRequest = require('../models/CardRequest');
const Card = require('../models/Card');
const Alert = require('../models/Alert');
const Transaction = require('../models/Transaction');
const { logAction } = require('../services/auditLog');
const { updateRiskScore } = require('../services/riskScore');

// User management
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password_hash');
  res.json(users);
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching user details for ID:', userId);
    
    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const accounts = await Account.find({ user_id: user._id });
    res.json({ user, accounts });
  } catch (err) {
    console.error('Error in getUserDetails:', err);
    res.status(500).json({ message: err.message });
  }
};
// Get user's transaction history (for employee)
const getUserTransactions = async (req, res) => {
  try {
    const { userId, accountId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get user's accounts
    const accounts = await Account.find({ user_id: userId });
    const accountIds = accounts.map(a => a._id);
    
    // If specific account requested, filter by that
    let filter = { $or: [{ from_account: { $in: accountIds } }, { to_account: { $in: accountIds } }] };
    if (accountId) {
      filter = { $or: [{ from_account: accountId }, { to_account: accountId }] };
    }
    
    const transactions = await Transaction.find(filter).sort({ timestamp: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Freeze account (combined freeze/unfreeze)
const freezeAccount = async (req, res) => {
  const { accountId, freeze } = req.body; // freeze: true/false
  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  if (freeze) {
    if (account.status === 'frozen') {
      return res.status(400).json({ message: 'Account is already frozen' });
    }
    account.status = 'frozen';
  } else {
    if (account.status !== 'frozen') {
      return res.status(400).json({ message: 'Account is not frozen' });
    }
    account.status = 'active';
  }
  
  await account.save();
  await logAction({ 
    employeeId: req.employee._id, 
    action: freeze ? 'FREEZE_ACCOUNT' : 'UNFREEZE_ACCOUNT', 
    entity: 'accounts', 
    details: { accountId, newStatus: account.status }, 
    ip: req.clientIp 
  });
  
  res.json({ 
    message: `Account ${freeze ? 'frozen' : 'unfrozen'} successfully`,
    account: {
      _id: account._id,
      status: account.status
    }
  });
};

// Card requests
const getPendingCardRequests = async (req, res) => {
  const requests = await CardRequest.find({ status: 'pending' }).populate('user_id', 'full_name email');
  res.json(requests);
};

const approveCardRequest = async (req, res) => {
  const { requestId } = req.params;
  const request = await CardRequest.findById(requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  
  request.status = 'approved';
  request.reviewed_by = req.employee._id;
  await request.save();
  
  const maskedNumber = '****' + Math.floor(1000 + Math.random() * 9000);
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 3);
  const expiryStr = `${expiry.getMonth()+1}/${expiry.getFullYear().toString().slice(-2)}`;
  
  const account = await Account.findOne({ user_id: request.user_id });
  if (!account) return res.status(400).json({ message: 'No account found for user' });
  
  await Card.create({
    account_id: account._id,
    type: request.type,
    card_number_masked: maskedNumber,
    expiry: expiryStr,
    status: 'inactive'
  });
  
  await logAction({ 
    employeeId: req.employee._id, 
    action: 'APPROVE_CARD_REQUEST', 
    entity: 'card_requests', 
    details: { requestId, userId: request.user_id }, 
    ip: req.clientIp 
  });
  res.json({ message: 'Card approved and issued', cardNumber: maskedNumber, expiry: expiryStr });
};

const rejectCardRequest = async (req, res) => {
  const { requestId } = req.params;
  const request = await CardRequest.findByIdAndUpdate(
    requestId, 
    { status: 'rejected', reviewed_by: req.employee._id }, 
    { new: true }
  );
  if (!request) return res.status(404).json({ message: 'Request not found' });
  await logAction({ 
    employeeId: req.employee._id, 
    action: 'REJECT_CARD_REQUEST', 
    entity: 'card_requests', 
    details: { requestId }, 
    ip: req.clientIp 
  });
  res.json({ message: 'Card request rejected' });
};

// Alert management
const getOpenAlerts = async (req, res) => {
  const alerts = await Alert.find({ status: 'open' })
    .populate('user_id', 'full_name email')
    .populate('transaction_id')
    .sort({ created_at: -1 });
  res.json(alerts);
};

const resolveAlert = async (req, res) => {
  const { alertId } = req.params;
  const { resolution_note, markFalsePositive } = req.body;
  const alert = await Alert.findById(alertId);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  
  alert.status = 'resolved';
  alert.resolved_by = req.employee._id;
  alert.resolution_note = resolution_note;
  await alert.save();
  
  if (markFalsePositive && alert.transaction_id) {
    // Reduce risk score for false positive
    await updateRiskScore(alert.user_id, -10);
  }
  
  await logAction({ 
    employeeId: req.employee._id, 
    action: 'RESOLVE_ALERT', 
    entity: 'alerts', 
    details: { alertId, resolution_note, markFalsePositive }, 
    ip: req.clientIp 
  });
  res.json({ message: 'Alert resolved', alert });
};

// Suspend account (admin only - more severe than freeze)
const suspendAccount = async (req, res) => {
  const { accountId, reason } = req.body;
  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  if (account.status === 'suspended') {
    return res.status(400).json({ message: 'Account is already suspended' });
  }
  
  account.status = 'suspended';
  await account.save();
  
  await logAction({ 
    employeeId: req.employee._id, 
    action: 'SUSPEND_ACCOUNT', 
    entity: 'accounts', 
    details: { accountId, reason }, 
    ip: req.clientIp 
  });
  
  res.json({ message: 'Account suspended', account });
};

// Unsuspend account
const unsuspendAccount = async (req, res) => {
  const { accountId } = req.body;
  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  if (account.status !== 'suspended') {
    return res.status(400).json({ message: 'Account is not suspended' });
  }
  
  account.status = 'active';
  await account.save();
  
  await logAction({ 
    employeeId: req.employee._id, 
    action: 'UNSUSPEND_ACCOUNT', 
    entity: 'accounts', 
    details: { accountId }, 
    ip: req.clientIp 
  });
  
  res.json({ message: 'Account unsuspended', account });
};

module.exports = {
  getAllUsers, 
  getUserDetails, 
  getUserTransactions,
  freezeAccount,
  suspendAccount,
  unsuspendAccount,
  getPendingCardRequests, 
  approveCardRequest, 
  rejectCardRequest,
  getOpenAlerts, 
  resolveAlert
};