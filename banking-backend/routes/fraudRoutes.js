const express = require('express');
const { protectEmployee, authorize } = require('../middleware/employeeAuth');
const { 
  getFraudRules, 
  addFraudRule, 
  updateFraudRule, 
  deleteFraudRule,
  getRiskProfiles, 
  updateRiskScoreManually,
  getRiskProfileByUser
} = require('../controllers/fraudController');
const router = express.Router();

router.use(protectEmployee);
router.use(authorize('admin'));

router.get('/rules', getFraudRules);
router.post('/rules', addFraudRule);
router.put('/rules/:id', updateFraudRule);
router.delete('/rules/:id', deleteFraudRule);

router.get('/risk-profiles', getRiskProfiles);
router.get('/risk-profiles/:userId', getRiskProfileByUser);
router.post('/risk-profiles/update', updateRiskScoreManually);

module.exports = router;