const User = require('../models/User');
const Account = require('../models/Account');
const Beneficiary = require('../models/Beneficiary');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { logAction } = require('../services/auditLog');

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password_hash');
  res.json(user);
};

const getAccounts = async (req, res) => {
  const accounts = await Account.find({ user_id: req.user._id });
  res.json(accounts);
};

const addBeneficiary = async (req, res) => {
  try {
    const { name, bank, account_number, relation, otp } = req.body;
    
    // If OTP not provided, send OTP first
    if (!otp) {
      await sendOTP(req.user._id, req.user.email, 'beneficiary');
      return res.status(200).json({ 
        message: 'OTP sent to your email. Please verify to add beneficiary.',
        otpRequired: true 
      });
    }
    
    // Verify OTP
    const isValid = await verifyOTP(req.user._id, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Check if beneficiary already exists
    const existing = await Beneficiary.findOne({ 
      user_id: req.user._id, 
      account_number: account_number 
    });
    if (existing) {
      return res.status(400).json({ message: 'Beneficiary already exists' });
    }
    
    // Add beneficiary
    const beneficiary = await Beneficiary.create({
      user_id: req.user._id,
      name, 
      bank, 
      account_number, 
      relation
    });
    
    await logAction({ 
      userId: req.user._id, 
      action: 'ADD_BENEFICIARY', 
      entity: 'beneficiaries', 
      details: { name, bank, account_number },
      ip: req.clientIp 
    });
    
    res.status(201).json({ message: 'Beneficiary added successfully', beneficiary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBeneficiaries = async (req, res) => {
  const beneficiaries = await Beneficiary.find({ user_id: req.user._id });
  res.json(beneficiaries);
};

const deleteBeneficiary = async (req, res) => {
  await Beneficiary.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  await logAction({ 
    userId: req.user._id, 
    action: 'DELETE_BENEFICIARY', 
    entity: 'beneficiaries', 
    ip: req.clientIp 
  });
  res.json({ message: 'Beneficiary deleted' });
};

module.exports = { getProfile, getAccounts, addBeneficiary, getBeneficiaries, deleteBeneficiary };