import { Server } from 'socket.io'

let sockets = []
let bets = []
const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      sockets.hasBet = false
      sockets.push(socket)
      socket.on('choose-role', msg => {
        socket.broadcast.emit('send-role', msg)
      })

      socket.on('bet', amount => {
        if(sockets.hasBet) return;
        sockets.hasBet = true
        bets.push(amount)
        socket.broadcast.emit('update-bets', bets)
      })
    })
  }
  res.end()
}

export default SocketHandler
