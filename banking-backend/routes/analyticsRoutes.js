const express = require('express');
const { protectEmployee, authorize } = require('../middleware/employeeAuth');
const { fraudByCategory, transactionsOverTime, riskDistribution, topRiskyUsers, transactionVolumeReport } = require('../controllers/analyticsController');
const router = express.Router();

router.use(protectEmployee);
router.use(authorize('fraud_analyst', 'admin', 'auditor'));

router.get('/fraud-category', fraudByCategory);
router.get('/transactions-over-time', transactionsOverTime);
router.get('/risk-distribution', riskDistribution);
router.get('/top-risky-users', topRiskyUsers);
router.get('/volume-report', transactionVolumeReport);

module.exports = router;