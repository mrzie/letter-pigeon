const defaultPort = 5387

const { argv } = process

let port;

const getArg = require('./getArg')

module.exports = + (getArg('--port') || getArg('-p') || defaultPort)