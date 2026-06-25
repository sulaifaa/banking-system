const express = require('express');
const { getProfile, getAccounts, addBeneficiary, getBeneficiaries, deleteBeneficiary } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/accounts', protect, getAccounts);
router.get('/beneficiaries', protect, getBeneficiaries);
router.post('/beneficiaries', protect, addBeneficiary);
router.delete('/beneficiaries/:id', protect, deleteBeneficiary);

module.exports = router;