const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  contact: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }  // [longitude, latitude]
  }
});

// Create geospatial index for proximity search (optional)
BranchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Branch', BranchSchema);