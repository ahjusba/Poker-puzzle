import { useState, useEffect } from 'react'
// import testJson from './testJson.json'
import handService from '../services/pokerNowHand'

const PokerReplayer = () => {

  const [gameStates, setGameStates] = useState([])
  const [currentState, setCurrentState] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const createGameStates = (json) => {
    console.log("Creating gameStates...")
    var states = []

    //Initialize
    var board = []
    var players = []
    var totalMoney = 0
    json.players.forEach((player) => {
      totalMoney += player.stack
      players.push(player)
    })

    states.push({ board: board, players: players, totalMoney: totalMoney, pot: 0 })


    json.events.forEach((event) => {
      if(states.length == 0) { console.error("GameState couldn't initialize") }
      //Copy the previous state as a starting reference
      var newState = structuredClone(states[states.length - 1])

      const eventType = event.payload.type
      const seat = event.payload.seat
      if(seat) {
        var player = newState.players.find(player => player.seat === seat)
      }
      
      const value = event.payload.value
      const previousValue = player?.value || 0
      const previousStack = player?.stack

      switch (eventType) {
        case 0:
          player.actionDescription = "Check"
          //Check
          break
        case 2:
          //Small blind
          player.actionDescription = "Post BB"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 3:
          //Big blind
          player.actionDescription = "Post SB"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 7:
          //Call
          player.actionDescription = "Call"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 8:
          //Bet, raise, re-raise
          player.actionDescription = "Raise"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 9:
          //Board card: flop, turn, river
          event.payload.cards.forEach((card) => {
            newState.board.push(card)
          })

          //Reset player values
          newState.players.forEach((player) => {
            player.actionDescription = ""
            player.value = 0
          })

          break
        case 10:
          //Collect pot
          
          newState.players.forEach((player) => {
            player.actionDescription = ""
            player.value = 0
          })
          player.actionDescription = "Collect pot"
          player.stack += newState.pot
          
          break
        case 11:
          //Fold
          player.actionDescription = "Folds"
          player.value = 0
          break
        case 12:
          //Reveal cards
          break
        case 15:
          //Hand finished
            
          break
        case 16:
          //Uncalled bet
          //Player has raised and others folded -> 
          //player takes the raise amount over call back          
          break
        default:
          console.log('Unknown event type:', eventType);
          break
      }

      var pot = totalMoney;
      newState.players.forEach((player) => {
        pot -= player.stack
      })
      newState.pot = pot

      states.push(newState)
      // console.log(newState)
    })

    console.log("Setting gameStates with ", states)
    setGameStates(states)
  }

  const nextState = () => {
    const newIndex = currentIndex + 1;
    if(newIndex >= gameStates.length) {
      return
    }
    setCurrentIndex(newIndex)
  }

  const previousState = () => {
    const newIndex = currentIndex - 1;
    if(newIndex < 0) {
      return
    }
    setCurrentIndex(newIndex)
  }

  const getHandIdentifier = (url) => {
    // Use a regular expression to extract the identifier after the last slash '/' in the URL
    // Example URL: "https://www.pokernow.club/hand-replayer/shared-hand/qumalwsqnn9j-7b8497a7433b3be"
    var match = url.match(/\/([^\/?]+)(?:\?|$)/)
    
    if (match && match[1]) {
      const identifier = match[1]
      return identifier
    }
  
    return null
  }

  const handleHandSubmit = async (url) => {
    console.log("URL submitted:", url)
    const handId = getHandIdentifier(url)  

    if (!handId) {
      console.error("Invalid URL format.");
      return;
    }
    console.log("Hand identifier:", handId)

    try {
      // Use the handService to fetch hand data
      const data = await handService.fetchHandData(handId);
      console.log("Fetched JSON data from backend:", data);
      createGameStates(data)
      setCurrentIndex(0)      
    } catch (error) {
      console.error("Error fetching JSON from backend:", error);
    }
  }

  // useEffect(() => {
  //   createGameStates()
  // }, [])

  useEffect(() => {  
    if(gameStates.length > 0) {
      setCurrentState(gameStates[currentIndex])
    }
  }, [currentIndex, gameStates])

  return (
    <div>
      <p>Please submit a poker hand from PokerNow</p>
      <HandInputField handleHandSubmit={handleHandSubmit}/>
      {currentState ? (
        <>
          <Players gameState={currentState} />
          <Board gameState={currentState} />
          <Pot gameState={currentState} />
          <button onClick={() => nextState()}>Next</button>
          <button onClick={() => previousState()}>Previous</button>
        </>
      ) :
      (
        <></>
      )}
      
      
    </div>
  )
}

const HandInputField = ({ handleHandSubmit }) => {
  const [url, setUrl] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    handleHandSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        />
      <button type="submit">Submit</button>
    </form>
  )
}

const Pot = ({ gameState }) => {
  return (
    <p>
      Pot: {gameState.pot}
    </p>
  )
}

const Board = ({ gameState }) => {

  var boardString = ""
  gameState?.board?.forEach((card) => {
    boardString += `${card} ` 
  })

  return (
    <div>
      {boardString}
    </div>
  )
}

const Players = ({ gameState }) => {
  return (
    <ul>      
      {gameState?.players?.map(player => {
        return (
          <Player 
            player={player}
            key={player.id}
          />
        )
      })}
    </ul>
  )
}

const Player = ({ player }) => {
  const nick = player.name
  const cards = player.hand
  const stack = player.stack
  const value = player.value
  const actionDescription = player.actionDescription

  return(
    <div>
      <p>{nick} [{cards ? cards : ""}] ({stack}) {actionDescription} {value == 0 ? "" : value}</p>
    </div>
  )
}

export default PokerReplayer