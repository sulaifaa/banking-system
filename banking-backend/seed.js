// seed.js
require('dotenv').config();
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const FraudRule = require('./models/FraudRule');

const seed = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Employee.deleteMany();
    await FraudRule.deleteMany();
    console.log('Cleared old employees and fraud rules');
    
    // Create admin employee
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await Employee.create({
      name: 'Admin User',
      email: 'admin@bank.com',
      password_hash: hashedPassword,
      role: 'admin',
      access_level: 'high',
      status: 'active'
    });
    console.log('✅ Admin employee created:');
    console.log('   Email: admin@bank.com');
    console.log('   Password: admin123');
    
    // Create fraud rules
    const rules = [
      {
        rule_name: 'High Amount (>50,000)',
        condition_type: 'amount',
        threshold_value: 50000,
        time_window_minutes: null,
        severity: 'high',
        is_active: true
      },
      {
        rule_name: 'Velocity (5 transactions in 10 min)',
        condition_type: 'velocity',
        threshold_value: 5,
        time_window_minutes: 10,
        severity: 'medium',
        is_active: true
      },
      {
        rule_name: 'Location Mismatch',
        condition_type: 'location',
        threshold_value: null,
        time_window_minutes: null,
        severity: 'high',
        is_active: true
      },
      {
        rule_name: 'New Beneficiary',
        condition_type: 'new_beneficiary',
        threshold_value: null,
        time_window_minutes: null,
        severity: 'medium',
        is_active: true
      }
    ];
    
    await FraudRule.insertMany(rules);
    console.log('✅ Fraud rules seeded:', rules.length, 'rules');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();