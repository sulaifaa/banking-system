const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, employeeId, action, entity, details, ip }) => {
  await AuditLog.create({
    user_id: userId,
    employee_id: employeeId,
    action,
    entity,
    details,
    ip_address: ip
  });
};

module.exports = { logAction };