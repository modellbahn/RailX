const socket = io()
socket.on('console-log', console.log)
const deb = new DeBSON(socket)
window.deb = deb