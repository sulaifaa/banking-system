const express = require('express');
const { protectEmployee, authorize } = require('../middleware/employeeAuth');
const captureInfo = require('../middleware/captureInfo');
const {
  getAllBranches,
  getBranchById,
  getBranchEmployees,
  findNearestBranches,
  createBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');

const router = express.Router();

// Public routes (anyone can view branches)
router.get('/', getAllBranches);
router.get('/nearest', findNearestBranches);
router.get('/:id', getBranchById);
router.get('/:id/employees', getBranchEmployees);

// Admin only routes
router.post('/', protectEmployee, authorize('admin'), captureInfo, createBranch);
router.put('/:id', protectEmployee, authorize('admin'), captureInfo, updateBranch);
router.delete('/:id', protectEmployee, authorize('admin'), captureInfo, deleteBranch);

module.exports = router;