import { Server } from 'socket.io'

let sockets = []
let horsePool = []
let horses = {}
let gamblers = {}
let state = 'betting'

function getRandomSubarray(arr) {
  return
  for(var i = 0; i < 4; ++i) {
    var index = Math.floor(Math.random() * arr.length)
    arr[index].leave('horsepool')
    // horses are defined by their position and acceleration
    horses[arr[index].id] = [0, 0]
    arr.splice(index, 1)
  }
}

const maketimer = (ticks, socket) => {
  socket.emit('update-timer', ticks)
  if(ticks <= 0) return;
  const epic = setTimeout(() => {
    maketimer(ticks-1, socket)
  }, 1000)
}

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new Server(res.socket.server)

    const clearRoom = (room) => {
      io.of('/').in(room).clients((error, socketIds) => {
        if (error) throw error;
        socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(room));
      });
    }

    const startGame = () => {
      console.log('starting round')
      getRandomSubarray(horsePool)
      io.in('horsepool').emit('send-role', 'gambler')
      for(var i in sockets) {
        if(!horses[sockets[i].id]) {
          gamblers[sockets[i].id] = 0
        }
      }
      state = 'betting'
    }

    const initGame = () => {
      state = 'init'
      horsePool = []
      horses = {}
      gamblers = {}
      io.emit('restart-game')
      maketimer(10, io)
      const timer = setTimeout(() => {
        startGame()
      }, 10000)
    }

    io.on('connection', socket => {
      socket.cash = 100
      sockets.push(socket)
      io.emit('update-playercount', sockets.length)
      io.emit('update-bets', gamblers)
      socket.on('bet', placeBet)
      socket.on('choose-role', chooseRole)

      socket.on('disconnect', (reason) => {
        console.log(socket.id)
        sockets.filter(player => player.id === socket.id);
        socket.broadcast.emit('update-playercount', sockets.length)
      })

      function placeBet(amount) {
            if(state == 'betting') {
              if(socket.role == 'gambler') {
                gamblers[socket.id] = amount
                io.emit('update-bets', gamblers)
                console.log('added player ' + socket.id + '\'s bet of ' + amount + ' to the betting pool')
              }
            }
          }

      function chooseRole(msg) {
        if(state == 'init') {
          if(!socket.role) {
              if(msg == 'gambler' || msg == 'horse') {
                if(socket.role === 'horse') {
                  horsePool.push(socket)
                  socket.join('horsepool')
                }
                socket.role = msg
                socket.emit('send-role', msg)
                socket.hasBet = false
                console.log('added player ' + socket.id + ' to the ' + msg + ' pool')
              }
            }
          }
        }
      })
    res.socket.server.io = io
    initGame()
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler
