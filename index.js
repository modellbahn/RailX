const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
// file deepcode ignore HttpToHttps: I love HTTP
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const deb = require('debson')
deb.folder(path.join(__dirname, '.DeBSON'))

app.use(express.static(path.join(__dirname, 'htdocs')))

io.on('connection', (socket) => {
    // Client connected
    socket.on('disconnect', () => {
        // Client disconnected
    })

    // Remote Database
    deb.bind(socket)

    socket.on('ping', () => {
        socket.emit('console-log', 'pong')
    })
})

server.listen(80, () => {
    console.log('listening on *:80')
})