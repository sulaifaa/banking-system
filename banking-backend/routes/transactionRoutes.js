const express = require('express');
const { transfer, getTransactionHistory } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const captureInfo = require('../middleware/captureInfo');
const router = express.Router();

router.post('/transfer', protect, captureInfo, transfer);
router.get('/history', protect, getTransactionHistory);

module.exports = router;