#!/usr/bin/env node
const { commandMatch } = require('./getArg')

const { getRemoteJSON } = require('./getJSON')
const getRemoteVersion = async () => (await getRemoteJSON('https://raw.githubusercontent.com/mrzie/letter-pigeon/master/package.json')).version

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
        handler: async () => {
            const local = require('../package.json').version
            const remote = await getRemoteVersion()

            if (!remote) {
                console.error('\n\033[41m\033[30mERROR\033[0m  获取远程版本失败\n')
                return
            }
            if (local === remote) {
                console.log("\n\033[32m" + local + "\033[0m    当前已经是最新版本\n\n")
                return
            }

            let msgs = [
                "",
                "\033[30m\033[47m有新版本\033[0m\n\n",
                local + "  ->  \033[32m" + remote + "\033[0m",
                "",
                "",
                "Loading...",
                "",
            ]

            console.log(msgs.join('\n'))

            require('child_process').execSync('npm install -g https://github.com/mrzie/letter-pigeon.git')
            console.log("\n好了😎\n\n")
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

const updateCmd = process.platform === 'win32'
    ? "npm install -g https://github.com/mrzie/letter-pigeon.git"
    : "pigeon update"

const checkVersion = async () => {
    const local = require('../package.json').version
    const remote = await getRemoteVersion()

    if (local && remote && local !== remote) {
        let msg = ''
        msg += "\n\033[30m\033[47m有新版本🤔\033[0m\n\n"

        msg += local + "  ->  \033[32m" + remote + "\033[0m\n\n"

        msg += "建议安装新版本：\n"
        msg += updateCmd;


        console.log(msg)
    }
}


main()