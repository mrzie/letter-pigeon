
const { exec } = require("child_process")

module.exports = url => {
    switch (process.platform) {
        //mac系统使用 一下命令打开url在浏览器
        case "darwin":
            exec(`open ${url}`);
        //win系统使用 一下命令打开url在浏览器
        case "win32":
            exec(`start ${url}`);
        // 默认mac系统
        default:
            exec(`open ${url}`);

    }
}