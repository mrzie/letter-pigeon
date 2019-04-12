const defaultPort = 5387

const { argv } = process

let port;

const { getSomeArg } = require('./getArg')

module.exports = + getSomeArg('--port', '-p') || defaultPort