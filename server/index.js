const
    path = require('path'),
    WSServer = require('ws').Server,
    Koa = require('koa'),
    route = require('koa-route'),
    send = require('koa-send'),
    domain = require('./getIp')

const port = require('./getPort')
const app = new Koa()

const sessionKey = + new Date()
const generateId = (id => () => id++)(0)

const staticRoot = path.resolve(__dirname, '../pages/dist')

app.keys = ['session-key']

app.use(route.all('/static/*', async ctx => {
    await send(ctx, ctx.path.replace(/^\/static\//, ''), { root: staticRoot })
}))

const session = {}

app.use(async (ctx, next) => {
    let cookieName = ctx.cookies.get('name')
    if (!cookieName || !session[cookieName]) {
        const id = generateId()
        cookieName = `${sessionKey}.${id}`
        session[cookieName] = `设备${id}`
        ctx.cookies.set('name', cookieName, {signed: true})
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
    const name = session[ctx.cookies.get('name')]

    const send = value => ws.send(JSON.stringify(value))


    if (!name) {
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
                            from: { msgId, name },
                            time: +new Date(),
                        })
                    } else if (msgType === 'img' && typeof base64 === 'string') {
                        broadcast({
                            type: 'document',
                            content: { msgType, base64 },
                            from: { msgId, name },
                            time: +new Date(),
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
require('qrcode-terminal').generate(pathToOpen)


require('./openUrl')(pathToOpen)
