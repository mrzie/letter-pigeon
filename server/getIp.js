var os = require('os'),
    ifaces = os.networkInterfaces();
    
const ips = Object
.values(ifaces)
.reduce((arr, iface) => [...arr, ...iface], [])
.filter(detail => detail.family === 'IPv4')
.map(detail => detail.address)
.filter(ip => ip.indexOf('10.') === 0 || ip.indexOf('172.') === 0 || ip.indexOf('192.') === 0)

module.exports = ips[0]