const os = require('os');

const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    let ipAddress;
    for (const key in interfaces) {
      for (const iface of interfaces[key]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
          break;
        }
      }
      // if (ipAddress) break;
    }
    return ipAddress || 'Unable to retrieve local IP address';
  }

  module.exports = getLocalIpAddress