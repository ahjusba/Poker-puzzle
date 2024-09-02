import { useState, useEffect } from 'react'

const PokerReplayer = ({data}) => {

  const [gameStates, setGameStates] = useState([])
  const [currentState, setCurrentState] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [warningMessage, setWarningMessage] = useState('')

  const createGameStates = (json) => {
    console.log("Creating gameStates with json:", json)
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
          //Check
          player.actionDescription = "Check"
          player.value = 0
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
        case 6:
          //Straddle
          player.actionDescription = "Post Straddle"
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
          player.stack += value
          
          break
        case 11:
          //Fold
          player.actionDescription = "Fold"
          player.value = 0
          break
        case 12:
          //Reveal cards
          newState.players.forEach((player) => {
            player.actionDescription = ""
            player.value = 0
          })
          player.actionDescription = "Reveal cards"
          break
        case 14:
          //Run-it-twice decision
          var approved = event.payload.approved === true ? "approved" : "not approved"
          newState.players.forEach((player) => {
            player.actionDescription = `run it twice ${approved}`
            player.value = 0
          })
          break
        case 15:
          //Hand finished
          newState.players.forEach((player) => {
            player.actionDescription = "Hand finished"
            player.value = 0
          })
          break
        case 16:
          //Uncalled bet
          //Player has raised and others folded -> player takes the raise amount over call back
          player.actionDescription = "Return uncalled bet"
          player.value = value
          player.stack += value
          break
        default:
          console.log('Unknown event type:', eventType)
          setWarningMessage("Unknown action type. Please send the URL to Jussi for investigation.")
          break
      }

      newState.pot = totalMoney - newState.players.reduce((sum, player) => sum + player.stack, 0)
      states.push(newState)
    })

    console.log("Setting gameStates with ", states)
    setGameStates(states)
  }

  const nextState = () => {
    const newIndex = currentIndex + 1
    if(newIndex >= gameStates.length) {
      return
    }
    setCurrentIndex(newIndex)
  }

  const previousState = () => {
    const newIndex = currentIndex - 1
    if(newIndex < 0) {
      return
    }
    setCurrentIndex(newIndex)
  }

  useEffect(() => {  
    if(gameStates.length > 0) {
      setCurrentState(gameStates[currentIndex])
    }
  }, [currentIndex, gameStates])

  useEffect(() => {
    if(data) {
      createGameStates(data)
    }
  }, [])

  return (
    <div>
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
      
      {warningMessage && <WarningMessage warningMessage={warningMessage}/>}
    </div>
  )
}

const WarningMessage = ({ warningMessage }) => {
  return(
    <div>
      <p>{warningMessage}</p>
    </div>
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
  //We might have two boards if run-it-twice
  var board1String = ""
  var board2String = ""
  var cardCount = 0
  gameState?.board?.forEach((card) => {
    cardCount += 1
    if(cardCount <= 5) {
      board1String += `${card} ` 
    } else {
      board2String += `${card} ` 
    }

  })

  return (
    <p>
      {board1String}
      <br></br>
      {board2String}
    </p>
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

const Player = ({ player: { name, hand, stack, value, actionDescription } }) => {
  return(
    <div>
      <p>{name} [{hand || ''}] ({stack}) {actionDescription} {value ? value : ""}</p>
    </div>
  )
}

export default PokerReplayer