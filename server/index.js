import express from 'express'
import {Server} from 'socket.io'
import http from 'http'
import path from 'path'
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const server = express()
const HTTPServer = http.Server(server)
const socket = new Server(HTTPServer)

const __dirname = dirname(fileURLToPath(import.meta.url))
server.use('/assets', express.static(__dirname + '/../assets/'))

function send(res, file) {
    return res.sendFile(file, {root: path.join(__dirname + '/../views')})
}

socket.on('connection', (socket) => {
    console.log('new connection')
})

server.get('/', (req, res) => {
    send(res, 'index.html')
})

HTTPServer.listen(3000, ()=> {
    console.log("Started HTTP server. Port:", 3000)
})