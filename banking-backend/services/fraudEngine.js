const FraudRule = require('../models/FraudRule');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const { updateRiskScore } = require('./riskScore');
const LoginSession = require('../models/LoginSession');

const evaluateTransaction = async (transactionData, user, session) => {
  const { from_account, to_account, amount, location, user_id } = transactionData;
  let flags = [];
  let riskIncrement = 0;
  
  const Beneficiary = require('../models/Beneficiary');
  const isBeneficiary = await Beneficiary.findOne({ 
    user_id: user_id, 
    account_number: to_account 
  });
  
  const fromAccountStr = from_account.toString();
  const toAccountStr = to_account.toString();
  
  // ✅ REMOVED user_id from this query - using only from_account and to_account
  const previousTransfer = await Transaction.findOne({
    from_account: fromAccountStr,
    to_account: toAccountStr,
    status: { $in: ['success', 'flagged'] }
  });
  
  console.log('Previous transfer to this account:', previousTransfer ? 'YES' : 'NO');
  
  const rules = await FraudRule.find({ is_active: true });
  
  for (const rule of rules) {
    if (rule.condition_type === 'amount') {
      const fraudThreshold = isBeneficiary ? 500000 : 50000;
      if (amount > fraudThreshold) {
        flags.push('HIGH_AMOUNT');
        riskIncrement += 30;
        await createAlert(user_id, null, 'high_amount', rule.severity, 
          `Transaction amount ${amount} exceeds fraud threshold of ${fraudThreshold}`);
      }
    }
    else if (rule.condition_type === 'velocity') {
      const windowDate = new Date(Date.now() - rule.time_window_minutes * 60000);
      const recentCount = await Transaction.countDocuments({
        from_account: fromAccountStr,
        timestamp: { $gte: windowDate }
      });
      if (recentCount >= rule.threshold_value) {
        flags.push('HIGH_VELOCITY');
        riskIncrement += 25;
        await createAlert(user_id, null, 'velocity', rule.severity, 
          `${recentCount} transactions in ${rule.time_window_minutes} min`);
      }
    }
    else if (rule.condition_type === 'location') {
      if (session && session.location && location && session.location !== location) {
        flags.push('LOCATION_MISMATCH');
        riskIncrement += 20;
        await createAlert(user_id, null, 'location_mismatch', rule.severity, 
          `Login location ${session.location} vs tx location ${location}`);
      }
    }
    else if (rule.condition_type === 'new_beneficiary') {
      // Only flag if NOT a beneficiary AND first time sending to this account
      if (!isBeneficiary && !previousTransfer) {
        flags.push('NEW_RECIPIENT');
        riskIncrement += 20;
        await createAlert(user_id, null, 'new_recipient', rule.severity, 
          'First time sending to this account (not a saved beneficiary)');
      }
    }
  }
  
  if (flags.length > 0) {
    await updateRiskScore(user_id, riskIncrement);
  }
  
  const finalRisk = riskIncrement + (session ? 0 : 10);
  let status = 'success';
  if (finalRisk > 70) status = 'flagged';
  if (finalRisk > 90) status = 'failed';
  
  return { flags, risk_score: finalRisk, status, isBeneficiary };
};

const createAlert = async (userId, transactionId, fraudType, severity, reason) => {
  await Alert.create({
    user_id: userId,
    transaction_id: transactionId,
    fraud_type: fraudType,
    severity,
    reason,
    status: 'open'
  });
};

module.exports = { evaluateTransaction };