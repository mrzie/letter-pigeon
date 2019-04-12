#!/usr/bin/env node
const { argv } = process

const main = () => {
    if (argv.includes('--help') || argv.includes('-h')) {
        console.log('不要皮 =_=\n')
    } else if (argv.includes('--version') || argv.includes('-v')) {
        const packageJson = require('../package.json')
        console.log(`当前版本：\n${packageJson.version}\n`)
    } else {
        require('./index')


        checkVersion().catch(e => void(0))

    }
}

const checkVersion = async () => {
    const { getFileJSON, getRemoteJSON } = require('./getJSON')
    const path = require('path')
    const [local, remote] = await Promise.all([
        getFileJSON(path.resolve(__dirname, '../package.json')),
        getRemoteJSON('https://raw.githubusercontent.com/mrzie/letter-pigeon/master/package.json')
    ])

    if (local.version && remote.version && local.version !== remote.version) {
        let msg = ''
        msg += "\n\033[30m\033[47m有新版本\033[0m\n\n"

        msg += local.version + "  ->  \033[32m" + remote.version + "\033[0m\n\n"

        msg += "建议安装新版本： npm install -g https://github.com/mrzie/letter-pigeon.git\n\n"


        console.log(msg)
    }
}


main()