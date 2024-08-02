const os = require('os');

const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    let ipAddresses = [];
    for (const key in interfaces) {
      for (const iface of interfaces[key]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddresses.push(iface.address)
          break;
        }
      }
      // if (ipAddress) break;
    }
    return ipAddresses || [];
  }

  module.exports = getLocalIpAddress