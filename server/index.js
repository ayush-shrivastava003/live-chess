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
var clients = {'1234': []}

server.use('/assets', express.static(__dirname + '/../assets/'))

function send(res, file) {
    return res.sendFile(file, {root: path.join(__dirname + '/../views')})
}

socket.on('connection', (socket) => {
    let url = socket.handshake.query.url.split('/')[3]
    clients[url].push(socket.id)
    socket.broadcast.emit('player connect')

    socket.on('move', (board) => { // when client emits a change to the board
        socket.broadcast.emit('move', {board: board}) // server emits to other clients
    })

    socket.on('disconnect', () => {
        clients[url].splice(clients[url].indexOf(socket.id), 1)
        socket.broadcast.emit('player disconnect')
    })
})

server.get('/', (req, res) => {
    send(res, 'index.html')
})

server.get('/:room', (req, res) => {
    let roomID = req.params.room
    if (req.params.room in clients) { // DEFINITELY going to need a db to scale this up
        if (clients[req.params.room].length >= 2) {
            res.send('Sorry, this game is already in progress.')
        } else {
            send(res, 'game.html')
    }} else {
        res.send('Couldn\'t find that room!')
    }
})

HTTPServer.listen(3000, ()=> {
    console.log("Started HTTP server. Port:", 3000)
})