const express = require('express');
const { protect } = require('../middleware/auth');
const captureInfo = require('../middleware/captureInfo');
const {
  makePayment,
  getPaymentHistory,
  getSpendingByCategory
} = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);

router.post('/pay', captureInfo, makePayment);
router.get('/history', getPaymentHistory);
router.get('/spending-by-category', getSpendingByCategory);

module.exports = router;