const defaultPort = 5387

const { argv } = process

let port;

const getArg = (name, argv = process.argv) => {
    const index = argv.indexOf(name)
    if (index !== -1) {
        return argv[index + 1]
    }
    return false
}

module.exports = + (getArg('--port') || getArg('-p' || defaultPort))