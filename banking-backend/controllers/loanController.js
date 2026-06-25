const Loan = require('../models/Loan');
const Account = require('../models/Account');
const RiskProfile = require('../models/RiskProfile');
const Transaction = require('../models/Transaction');
const { logAction } = require('../services/auditLog');
const mongoose = require('mongoose');

// Calculate monthly installment
const calculateMonthlyInstallment = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
};

// Calculate realistic interest rate based on multiple factors
const calculateInterestRate = async (userId, principal, durationMonths, user) => {
  let baseRate = 12; // Pakistan average personal loan rate
  
  // Factor 1: Get user's risk score
  const riskProfile = await RiskProfile.findOne({ user_id: userId });
  const riskScore = riskProfile?.risk_score || 50;
  
  // Risk score adjustment (0-100 scale)
  if (riskScore < 30) {
    baseRate -= 3; // Excellent credit
  } else if (riskScore < 50) {
    baseRate -= 1.5; // Good credit
  } else if (riskScore < 70) {
    baseRate += 0; // Average credit
  } else if (riskScore < 85) {
    baseRate += 3; // Below average
  } else {
    baseRate += 6; // High risk
  }
  
  // Factor 2: Loan amount adjustment
  if (principal >= 500000) {
    baseRate -= 1.5; // Large loan discount
  } else if (principal >= 100000) {
    baseRate -= 0.5; // Medium loan
  } else if (principal < 30000) {
    baseRate += 2; // Small loan penalty
  }
  
  // Factor 3: Duration adjustment
  if (durationMonths <= 12) {
    baseRate -= 0.5; // Short term discount
  } else if (durationMonths > 36) {
    baseRate += 1.5; // Long term premium
  }
  
  // Factor 4: Account tenure (if user created_at exists)
  if (user && user.created_at) {
    const accountAgeMonths = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 30);
    if (accountAgeMonths > 24) {
      baseRate -= 1; // Loyal customer discount
    } else if (accountAgeMonths < 6) {
      baseRate += 1; // New customer premium
    }
  }
  
  // Ensure rate stays within realistic bounds (8% to 28%)
  return Math.min(28, Math.max(8, parseFloat(baseRate.toFixed(1))));
};

// Customer: Apply for loan
const applyLoan = async (req, res) => {
  try {
    const { principal, duration_months } = req.body;
    const user = req.user;
    
    // Validate loan amount
    if (principal < 10000) {
      return res.status(400).json({ message: 'Minimum loan amount is Rs 10,000' });
    }
    if (principal > 10000000) {
      return res.status(400).json({ message: 'Maximum loan amount is Rs 10,000,000' });
    }
    
    // Calculate realistic interest rate
    const interestRate = await calculateInterestRate(user._id, principal, duration_months, user);
    
    // Calculate monthly installment
    const monthlyInstallment = calculateMonthlyInstallment(principal, interestRate, duration_months);
    
    const loan = await Loan.create({
      user_id: user._id,
      principal,
      interest_rate: interestRate,
      duration_months,
      remaining_balance: principal,
      status: 'pending',
      monthly_installment: Math.round(monthlyInstallment)
    });
    
    await logAction({
      userId: user._id,
      action: 'APPLY_LOAN',
      entity: 'loans',
      details: { loanId: loan._id, principal, interestRate, duration_months },
      ip: req.clientIp
    });
    
    res.status(201).json({
      message: 'Loan application submitted',
      loan,
      monthly_installment: Math.round(monthlyInstallment),
      interest_rate: interestRate
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Customer: Get my loans
const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.json(loans);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Get all loans (for employee)
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('user_id', 'full_name email');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Customer: Make loan repayment
const makeRepayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { loanId, amount } = req.body;
    const user = req.user;
    
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) throw new Error('Loan not found');
    if (loan.user_id.toString() !== user._id.toString()) throw new Error('Not your loan');
    if (loan.status !== 'active') throw new Error('Loan is not active');
    
    // Find user's account to deduct from
    const account = await Account.findOne({ user_id: user._id }).session(session);
    if (!account) throw new Error('No account found');
    if (account.balance < amount) throw new Error('Insufficient balance');
    
    // Calculate new remaining balance
    let repaymentAmount = amount;
    if (repaymentAmount > loan.remaining_balance) {
      repaymentAmount = loan.remaining_balance;
    }
    
    // Deduct from account
    account.balance -= repaymentAmount;
    await account.save({ session });
    
    // Update loan
    loan.remaining_balance -= repaymentAmount;
    if (loan.remaining_balance <= 0) {
      loan.remaining_balance = 0;
      loan.status = 'paid';
    }
    await loan.save({ session });
    
    // Create transaction record
    await Transaction.create([{
      from_account: account._id,
      to_account: account._id,
      amount: repaymentAmount,
      type: 'loan_repayment',
      channel: 'app',
      location: req.location,
      status: 'success'
    }], { session });
    
    await logAction({
      userId: user._id,
      action: 'LOAN_REPAYMENT',
      entity: 'loans',
      details: { loanId, amount: repaymentAmount, remaining: loan.remaining_balance },
      ip: req.clientIp
    });
    
    await session.commitTransaction();
    
    res.json({
      message: `Repayment of ${repaymentAmount} received`,
      remaining_balance: loan.remaining_balance,
      status: loan.status
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Employee: Get pending loan applications
const getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'pending' }).populate('user_id', 'full_name email');
    res.json(loans);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Employee: Approve loan
const approveLoan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'pending') throw new Error('Loan already processed');
    
    loan.status = 'active';
    loan.approved_by = req.employee._id;
    loan.approved_at = new Date();
    await loan.save({ session });
    
    // Credit loan amount to user's account
    const account = await Account.findOne({ user_id: loan.user_id }).session(session);
    if (!account) throw new Error('User has no account');
    
    account.balance += loan.principal;
    await account.save({ session });
    
    await Transaction.create([{
      from_account: account._id,
      to_account: account._id,
      amount: loan.principal,
      type: 'loan_disbursement',
      channel: 'employee',
      status: 'success'
    }], { session });
    
    await logAction({
      employeeId: req.employee._id,
      action: 'APPROVE_LOAN',
      entity: 'loans',
      details: { loanId, userId: loan.user_id, amount: loan.principal },
      ip: req.clientIp
    });
    
    await session.commitTransaction();
    
    res.json({ message: 'Loan approved and amount credited', loan });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// Employee: Reject loan
const rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findByIdAndUpdate(
      loanId,
      { status: 'rejected', approved_by: req.employee._id, approved_at: new Date() },
      { new: true }
    );
    
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    await logAction({
      employeeId: req.employee._id,
      action: 'REJECT_LOAN',
      entity: 'loans',
      details: { loanId, userId: loan.user_id },
      ip: req.clientIp
    });
    
    res.json({ message: 'Loan rejected', loan });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  applyLoan,
  getMyLoans,
  makeRepayment,
  getPendingLoans,
  approveLoan,
  rejectLoan,
  getAllLoans  
};