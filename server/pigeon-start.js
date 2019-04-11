#!/usr/bin/env node
const { argv } = process

if (argv.includes('--help') || argv.includes('-h')) {
    console.log('不要皮 =_=\n')
} else if (argv.includes('--version') || argv.includes('-v')) {
    const packageJson = require('../package.json')
    console.log(`当前版本：\n${packageJson.version}\n`)
} else {
    require('./index')
}