const express = require('express');
const { requestCard, getMyCards, activateCard, getCardRequests } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/request', protect, requestCard);
router.get('/my-cards', protect, getMyCards);
router.put('/activate/:cardId', protect, activateCard);
router.get('/card-requests', protect, getCardRequests);  // ← Add this line

module.exports = router;