#!/usr/bin/env node
const { argsMatch } = require('./getArg')

const exclusiveCommands = [
    {
        match: ['--help', '-h'],
        handler: () => {
            console.log('不要皮 =_=\n')
        }
    },
    {
        match: ['--version', '-v'],
        handler: () => {
            const packageJson = require('../package.json')
            console.log(`当前版本：\n${packageJson.version}\n`)
        }
    },
]

const main = () => {
    for (const { match, handler } of exclusiveCommands) {
        if (argsMatch(match)) {
            handler()
            return
        }
    }

    require('./index')
    checkVersion().catch(e => void (0))
}

const checkVersion = async () => {
    const { getRemoteJSON } = require('./getJSON')
    const local = require('../package.json')
    const remote = await getRemoteJSON('https://raw.githubusercontent.com/mrzie/letter-pigeon/master/package.json')

    if (local.version && remote.version && local.version !== remote.version) {
        let msg = ''
        msg += "\n\033[30m\033[47m有新版本\033[0m\n\n"

        msg += local.version + "  ->  \033[32m" + remote.version + "\033[0m\n\n"

        msg += "建议安装新版本： npm install -g https://github.com/mrzie/letter-pigeon.git\n\n"


        console.log(msg)
    }
}

main()