/**
 * Network Info Script
 * Displays the local network IP address so users know how to access the app
 * from other devices on the same network.
 */
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const ip = getLocalIP();
const port = 3000;

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║            🌐 Network Access Enabled                    ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║  Local:   http://localhost:${port}                         ║`);
console.log(`║  Network: http://${ip}:${port}                  ║`);
console.log('║                                                          ║');
console.log('║  Other devices on your network can access the app at:    ║');
console.log(`║  → http://${ip}:${port}                                 ║`);
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

module.exports = { getLocalIP, ip, port };