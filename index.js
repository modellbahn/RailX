const express = require('express')
const app = express()
const http = require('http')
// file deepcode ignore HttpToHttps: I love HTTP
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

app.get('/', (req, res) => {
    res.send('Hello World')
})

io.on('connection', (socket) => {
    // Client connected
})

server.listen(80, () => {
  console.log('listening on *:80')
})