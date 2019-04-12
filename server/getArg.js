const { argv } = process

const getArg = name => {
    const index = argv.indexOf(name)
    if (index !== -1) {
        return argv[index + 1]
    }
    return false
}

const getSomeArg = (...names) => {
    for (const name of names) {
        const value = getArg(name)
        if (value !== false) {
            return value
        }
    }
    return false
}


const argsMatch = match => {
    if (match instanceof Array) {
        return argsMatch(v => match.includes(v))
    }
    if (match instanceof String) {
        return argsMatch(v => match === v)
    }
    if (match instanceof Function) {
        return argv.some(match)
    }
    return false
}



module.exports = {
    getArg,
    getSomeArg,
    argsMatch,
}