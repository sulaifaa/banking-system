// Captures IP, device, location (simplified location from IP)
const requestIp = require('request-ip'); // install if needed, or use req.ip

const captureInfo = (req, res, next) => {
  req.clientIp = req.ip || req.connection.remoteAddress;
  req.deviceInfo = req.headers['user-agent'] || 'unknown';
  // For location, you would call a geolocation API. Here we mock.
  req.location = 'Unknown'; // or use a library like geoip-lite
  next();
};

module.exports = captureInfo;