const express = require('express');
const { protectEmployee, authorize } = require('../middleware/employeeAuth');
const captureInfo = require('../middleware/captureInfo');
const {
  getAllUsers, 
  getUserDetails, 
  freezeAccount,
  suspendAccount,
  unsuspendAccount,
  getPendingCardRequests, 
  approveCardRequest, 
  rejectCardRequest,
  getOpenAlerts, 
  resolveAlert,
  getUserTransactions
} = require('../controllers/employeeController');

const router = express.Router();
router.use(protectEmployee);
router.use(authorize('fraud_analyst', 'admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.post('/accounts/freeze', captureInfo, freezeAccount);
router.get('/users/:userId/transactions', getUserTransactions);
router.get('/users/:userId/accounts/:accountId/transactions', getUserTransactions);

// Account suspension (admin only - higher severity)
router.post('/accounts/suspend', captureInfo, suspendAccount);
router.post('/accounts/unsuspend', captureInfo, unsuspendAccount);

// Card requests
router.get('/card-requests', getPendingCardRequests);
router.post('/card-requests/:requestId/approve', captureInfo, approveCardRequest);
router.post('/card-requests/:requestId/reject', captureInfo, rejectCardRequest);

// Alerts
router.get('/alerts/open', getOpenAlerts);
router.post('/alerts/:alertId/resolve', captureInfo, resolveAlert);

module.exports = router;