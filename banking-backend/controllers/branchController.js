const Branch = require('../models/Branch');
const Employee = require('../models/Employee');
const { logAction } = require('../services/auditLog');

// Get all branches
// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find().lean();
    // Ensure _id is included
    const branchesWithId = branches.map(branch => ({
      _id: branch._id,
      name: branch.name,
      city: branch.city,
      address: branch.address,
      contact: branch.contact,
      location: branch.location,
      manager_id: branch.manager_id
    }));
    res.json(branchesWithId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single branch
const getBranchById = async (req, res) => {
  const branch = await Branch.findById(req.params.id).populate('manager_id', 'name email');
  if (!branch) return res.status(404).json({ message: 'Branch not found' });
  res.json(branch);
};

// Get employees by branch
const getBranchEmployees = async (req, res) => {
  const employees = await Employee.find({ branch_id: req.params.id });
  res.json(employees);
};

// Find nearest branches (using geolocation)
const findNearestBranches = async (req, res) => {
  const { longitude, latitude, maxDistance = 50000 } = req.query;
  
  if (!longitude || !latitude) {
    // Return all branches if no coordinates provided
    const branches = await Branch.find();
    return res.json(branches);
  }
  
  const branches = await Branch.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        distanceField: "distance_meters",
        maxDistance: parseInt(maxDistance),
        spherical: true
      }
    },
    { $sort: { distance_meters: 1 } },
    { $limit: 5 }
  ]);
  
  res.json(branches);
};

// Admin: Create branch
const createBranch = async (req, res) => {
  const { name, city, address, manager_id, contact, longitude, latitude } = req.body;
  
  const branchData = { name, city, address, manager_id, contact };
  
  if (longitude && latitude) {
    branchData.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }
  
  const branch = await Branch.create(branchData);
  
  await logAction({
    employeeId: req.employee._id,
    action: 'CREATE_BRANCH',
    entity: 'branches',
    details: { branchId: branch._id, name },
    ip: req.clientIp
  });
  
  res.status(201).json(branch);
};

// Admin: Update branch
const updateBranch = async (req, res) => {
  const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!branch) return res.status(404).json({ message: 'Branch not found' });
  
  await logAction({
    employeeId: req.employee._id,
    action: 'UPDATE_BRANCH',
    entity: 'branches',
    details: { branchId: branch._id },
    ip: req.clientIp
  });
  
  res.json(branch);
};

// Admin: Delete branch
const deleteBranch = async (req, res) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch) return res.status(404).json({ message: 'Branch not found' });
  
  await logAction({
    employeeId: req.employee._id,
    action: 'DELETE_BRANCH',
    entity: 'branches',
    details: { branchId: req.params.id },
    ip: req.clientIp
  });
  
  res.json({ message: 'Branch deleted' });
};

module.exports = {
  getAllBranches,
  getBranchById,
  getBranchEmployees,
  findNearestBranches,
  createBranch,
  updateBranch,
  deleteBranch
};