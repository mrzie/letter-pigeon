const
    path = require('path'),
    WSServer = require('ws').Server,
    Koa = require('koa'),
    route = require('koa-route'),
    send = require('koa-send'),
    session = require('koa-session'),
    domain = require('./getIp')

const port = 5387
const app = new Koa()
var qrcode = require('qrcode-terminal');

const generateId = (id => () => id++)(1)

const staticRoot = path.resolve(__dirname, '../pages/dist')

app.keys = ['session-key']

app.use(route.all('/static/*', async ctx => {
    await send(ctx, ctx.path.replace(/^\/static\//, ''), { root: staticRoot })
}))

const useSession = session(app)

app.use(useSession)

app.use(async (ctx, next) => {
    if (!ctx.session.name) {
        ctx.session.name = '终端' + generateId()

    }
    await next()
})

app.use(async ctx => {
    await send(ctx, 'index.html', { root: staticRoot })
})

const server = app.listen(port)

const wss = new WSServer({
    server,
})

const history = []
const broadcast = value => {
    history.push(value)
    const msg = JSON.stringify(value)
    wss.clients.forEach(client => client.send(msg))
}

wss.on('connection', (ws, req) => {
    const ctx = app.createContext(req, {})
    // console.log('upgrade', ctx.session.name)
    const name = ctx.session.name

    const send = value => ws.send(JSON.stringify(value))


    if (!name) {
        // ws.close()
        ws.send('none name')
    } else {
        send({
            type: 'operation',
            name: 'start',
            terminalName: name,
        })

        history.forEach(msg => send(msg))

        ws.on('message', raw => {
            try {
                const { type, content, from } = JSON.parse(raw)
                if (type === 'document') {
                    const { msgId } = from
                    const { msgType, text, base64 } = content
                    if (msgType === 'text' && typeof text === 'string') {
                        broadcast({
                            type: 'document',
                            content: { msgType, text },
                            from: { msgId, name }
                        })
                    } else if (msgType === 'img' && typeof base64 === 'string') {
                        broadcast({
                            type: 'document',
                            content: { msgType, base64 },
                            from: { msgId, name }
                        })
                    }
                }
            } catch (e) {
                // do nothing
            }
        })
    }
})


const pathToOpen = `http://${domain}:${port}`

console.log(`app run in ${pathToOpen} \n\n`)
console.log('扫描下方二维码进入：\n\n')
qrcode.generate(pathToOpen)


require('./openUrl')(pathToOpen)
