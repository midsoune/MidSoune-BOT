import express from 'express'
import { createServer } from 'http'
import { toBuffer } from 'qrcode'

function connect(conn, PORT) {
    let app = global.app = express()
    console.log(app)
    let server = global.server = createServer(app)
    let _qr = 'invalid'

    conn.ev.on('connection.update', function appQR({ qr }) {
        if (qr) _qr = qr
    })
 
    app.use(async (req, res) => {
        res.setHeader('content-type', 'image/png')
        res.end(await toBuffer(_qr))
    })

    server.listen(PORT, () => {
        console.log('App listened on port', PORT)
        if (opts['keepalive']) keepAlive()
    })
}
export default connect
