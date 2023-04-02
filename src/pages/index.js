import { useEffect, useState } from 'react'
import io from 'socket.io-client'
let socket;

const Home = () => {
  const [role, setRole] = useState('')
  const [bets, setBets] = useState('')
  const [localBet, setLocalBet] = useState('')
  const [players, setPlayers] = useState('')
  const [money, setMoney] = useState('')
  const [timer, setTimer] = useState('')

  const restartGame = () => {
    setRole('')
    setBets('')
    setLocalBet('')
    setTimer('')
    console.log('restarting the game')
  }

  useEffect(() => {
    async function initsocket() {
      await fetch('/api/socket');
      socket = io()

      socket.on('restart-game', () => {
        restartGame()
      })

      socket.on('connect', () => {
        console.log('connected with uid ' + socket.id)
      })

      socket.on('send-role', msg => {
        setRole(msg)
      })

      socket.on('update-bets', betList => {
        setBets(Object.entries(betList).map(([key, value]) => <li>Gambler {key} bet {value}</li>))
      })

      socket.on('update-timer', ticks => {
        setTimer(ticks)
      })

      socket.on('update-playercount', count => {
        setPlayers(count);
      })

    }
  initsocket();
  }, [])

  const onClickHandler = (gamer, e) => {
    socket.emit('choose-role', gamer);
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!localBet) return;
    socket.emit('bet', localBet);
    setLocalBet('');
  }

  return (
    <>
      <form method='POST' action='/' onSubmit={handleSubmit}>
      <button onClick={(e) => onClickHandler('horse', e)}>horse</button>
      <button onClick={(e) => onClickHandler('gambler', e)}>gambler</button>
      <input type='string' name='bet' value={localBet} onChange={(e) => setLocalBet(e.target.value)}/>
      <input type='submit' value='say so'/>
      <p>Player count: {players}</p>
      <p>You are a: {role}</p>
      <ul>
      {bets}
      </ul>
      <p>timer: {timer}</p>
    </form>
    </>
  );
}

export default Home;
