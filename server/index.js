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
let clients = {'1234': []}

server.use('/assets', express.static(__dirname + '/../assets/'))
server.use(express.json())

function send(res, file) {
    return res.sendFile(file, {root: path.join(__dirname + '/../views')})
}

socket.on('connection', (socket) => {
    let url = socket.handshake.query.url.split('/')[3]
    console.log(clients, url);
    clients[url].push(socket.id);
    socket.broadcast.emit('player connect')
    if (clients[url].length === 1) {
        socket.broadcast.emit("host");
    } else if (clients[url].length === 2) {
        socket.broadcast.emit("nothost");
    }

    socket.on('move', (board) => {
        socket.broadcast.emit('move', board)
    })

    socket.on('disconnect', () => {
        clients[url].splice(clients[url].indexOf(socket.id), 1)
        if (clients[url].length === 0) {
            delete clients[url];
        } else if (clients[url].length === 1) {
            socket.broadcast.emit('player disconnect')
        }
    })

    socket.on("start", () => {
        socket.broadcast.emit("start")
    })
    socket.on("exec", (code) => {
        eval(code);
    })
})

server.get('/', (req, res) => {
    send(res, 'index.html')
})

server.get('/:room', (req, res) => {
    if (req.params.room in clients) {
        if (clients[req.params.room].length >= 2) {
            send(res, 'inprog.html')
        } else {
            send(res, 'game.html')
    }} else {
        res.send('Couldn\'t find that room!')
    }
})

server.post('/', (req, res) => {
    let code = req.body.roomcode
    if (!clients[code]) {
        clients[code] = []
        return res.status(200).send("good code")
    } else {return res.status(400).send('This code already is in use!')}
})

HTTPServer.listen(3000, ()=> {
    console.log("Started HTTP server. Port:", 3000)
})