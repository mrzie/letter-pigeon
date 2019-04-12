#!/usr/bin/env node
const { argsMatch, commandMatch } = require('./getArg')


const showHelp = () => {
    const buildLine = (cmd, desc) => ('  ' + cmd).padEnd(26, ' ') + desc
    const msgs = [
        '',
        "Usages: pigeon <command>",
        '',
        buildLine('start', '启动服务'),
        buildLine('start -p xxxx', '启动并指定端口xxxx'),
        buildLine('update', '更新版本'),
        buildLine('-h, --help', '显示命令帮助'),
        buildLine('-v, --version', '查看当前版本'),
        '',
        '',
        'https://github.com/mrzie/letter-pigeon',
        '',
    ]

    const msg = msgs.join('\n')

    console.log(msg)
}

const exclusiveCommands = [
    {
        match: ['start'],
        handler: () => {

            require('./index')
            checkVersion().catch(e => void (0))
        }
    },
    {
        match: ['update'],
        handler: () => {
            require('child_process').exec('npm install -g https://github.com/mrzie/letter-pigeon.git')
        }
    },
    {
        match: ['--help', '-h'],
        handler: showHelp,
    },
    {
        match: ['--version', '-v'],
        handler: () => {
            console.log(require('../package.json').version)
        },
    },
]

const main = () => {
    for (const { match, handler } of exclusiveCommands) {
        if (commandMatch(match)) {
            handler()
            return
        }
    }

    showHelp()
}

const checkVersion = async () => {
    const { getRemoteJSON } = require('./getJSON')
    const local = require('../package.json')
    const remote = await getRemoteJSON('https://raw.githubusercontent.com/mrzie/letter-pigeon/master/package.json')

    if (local.version && remote.version && local.version !== remote.version) {
        let msg = ''
        msg += "\n\033[30m\033[47m有新版本\033[0m\n\n"

        msg += local.version + "  ->  \033[32m" + remote.version + "\033[0m\n\n"

        msg += "建议安装新版本： pigeon update"


        console.log(msg)
    }
}


main()