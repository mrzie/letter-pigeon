const https = require('https')
const fs = require('fs')

const getResponse = (url, timeout = 10000) => new Promise((resolve, reject) => {
    setTimeout(reject, timeout)
    https.get(url, res => {
        res.setEncoding('utf8')

        let raw = ''
        res.on('data', chunk => raw += chunk)
        res.on('end', () => resolve(raw))
    })
})

const getRemoteJSON = async url => {
    const raw = await getResponse(url)
    // console.log('get remote json', raw)
    return JSON.parse(raw)
}

const getFile = path => new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    })
})

const getFileJSON = async path => {
    const raw = await getFile(path)
    return JSON.parse(raw)
}

module.exports = {
    getRemoteJSON,
    getFileJSON,
}