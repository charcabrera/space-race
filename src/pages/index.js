import { useEffect, useState } from 'react'
import io from 'socket.io-client'
let socket;

const Home = () => {
  const [role, setRole] = useState('')
  const [bets, setBets] = useState('')
  const [localBet, setLocalBet] = useState('')

  useEffect(() => socketInitializer(), [])

  const socketInitializer = () => {
    async function initsocket() {
    await fetch('/api/socket');
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('send-role', msg => {
      setRole(msg)
    })

      socket.on('update-bets', betList => {
        setBets(betList.map((bet) => <li>{bet}</li>));
      })
    }
    initsocket();
  }

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
      <button onClick={(e) => onClickHandler('jockey', e)}>jockey</button>
      <button onClick={(e) => onClickHandler('horse', e)}>horse</button>
      <input type='string' name='bet' value={localBet} onChange={(e) => setLocalBet(e.target.value)}/>
      <input type='submit' value='say so'/>
      <ul>
      {bets}
      </ul>
    </form>
    </>
  );
}

export default Home;
