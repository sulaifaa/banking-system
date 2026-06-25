const express = require('express');
const { protect } = require('../middleware/auth');
const { protectEmployee, authorize } = require('../middleware/employeeAuth');
const captureInfo = require('../middleware/captureInfo');
const {
  applyLoan,
  getMyLoans,
  makeRepayment,
  getPendingLoans,
  approveLoan,
  rejectLoan,
  getAllLoans  
} = require('../controllers/loanController');

const router = express.Router();

// Customer routes
router.post('/apply', protect, captureInfo, applyLoan);
router.get('/my-loans', protect, getMyLoans);
router.post('/repay', protect, captureInfo, makeRepayment);

// Employee routes
router.get('/pending', protectEmployee, authorize('admin'), getPendingLoans);
router.post('/:loanId/approve', protectEmployee, authorize('admin'), captureInfo, approveLoan);
router.post('/:loanId/reject', protectEmployee, authorize('admin'), captureInfo, rejectLoan);
router.get('/all', protectEmployee, authorize('admin', 'fraud_analyst'), getAllLoans);

module.exports = router;