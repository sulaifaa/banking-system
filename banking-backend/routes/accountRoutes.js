const express = require('express');
const { getBalance, deposit, withdraw } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
const captureInfo = require('../middleware/captureInfo');
const router = express.Router();

router.get('/:accountId/balance', protect, getBalance);
router.post('/:accountId/deposit', protect, captureInfo, deposit);
router.post('/:accountId/withdraw', protect, captureInfo, withdraw);

module.exports = router;