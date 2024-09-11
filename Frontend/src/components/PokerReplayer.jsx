import { useState, useEffect, useContext } from 'react'
import Card from './Card'
import './PokerReplayer.css'
import classNames from 'classnames'
import { TbPlayerTrackNext, TbPlayerTrackPrev  } from "react-icons/tb";
import { HandContext } from '../context/HandProvider'; 

const PokerReplayer = ({ data, viewOnly, hasVoted }) => {
  //https://www.pokernow.club/hand-replayer/game/pglcuV_rJVtWY2nUQx1TF2FSH current hands
  const [gameStates, setGameStates] = useState([])
  const [currentState, setCurrentState] = useState(null)
  // const [currentIndex, setCurrentIndex] = useState(0)
  const [warningMessage, setWarningMessage] = useState('')
  const { currentIndex, setCurrentIndex } = useContext(HandContext)

  const canUserPressNext = () => {
    return(hasVoted || !viewOnly || currentIndex < data.puzzlePoint)
  }

  const showCards = (playerSeat) => {
    return(hasVoted || !viewOnly || playerSeat === data.heroSeat)
  }

  const createGameStates = (json) => {
    // console.log("Creating gameStates with json:", json)
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

    const setPlayerPositions = (players, json) => {
      const smallBlindEvent = json.events.find(event => event.payload.type === 3)
      if(!smallBlindEvent) {
        console.log("No small blind event found")
        return
      }

      const smallBlindSeat = smallBlindEvent.payload.seat
  
      // Set Small Blind (SB) position
      const smallBlindPlayer = players.find(player => player.seat === smallBlindSeat)
      if (smallBlindPlayer) {
        smallBlindPlayer.position = "SB"
      }
  
      // Get sorted seat numbers
      const seatNumbers = players.map(player => player.seat).sort((a, b) => a - b)
  
      // Find the next seat for Big Blind - the next higher seat number
      const smallBlindIndex = seatNumbers.indexOf(smallBlindSeat)
      const bigBlindSeat = seatNumbers[(smallBlindIndex + 1) % seatNumbers.length]  // wrap around to first seat if needed
      const bigBlindPlayer = players.find(player => player.seat === bigBlindSeat)
      if (bigBlindPlayer) {
        bigBlindPlayer.position = "BB"
      }
  
      // Find the next seat for Dealer - the next lower seat number
      const dealerSeat = seatNumbers[(smallBlindIndex - 1 + seatNumbers.length) % seatNumbers.length]  // wrap around to last seat if needed
      const dealerPlayer = players.find(player => player.seat === dealerSeat)
      if (dealerPlayer) {
        dealerPlayer.position = "D"
      }

      //If we have only two players, the SB will be the D
      if(players.length === 2) {
        smallBlindPlayer.position = "D"
      }
    }

    const reorganizePlayers = (players) => {
      const dealerPlayer = players.find(player => player.position === "D")
    
      if (!dealerPlayer) {
        console.error("No dealer found in the player list.")
        return players
      }
    
      const dealerSeat = dealerPlayer.seat
    
      // Sort players by seat, starting from the dealer's seat and wrapping around
      const sortedPlayers = players
        .slice() // Create a copy of the array to avoid mutating the original
        .sort((a, b) => a.seat - b.seat) // Sort players by seat number
    
      // Find the index of the dealer in the sorted array
      const dealerIndex = sortedPlayers.findIndex(player => player.seat === dealerSeat)
    
      // Reorganize players so that the dealer is first, followed by the rest
      const reorganizedPlayers = [
        ...sortedPlayers.slice(dealerIndex), // From dealer to end
        ...sortedPlayers.slice(0, dealerIndex) // From start to dealer
      ]

      return reorganizedPlayers
    }

    setPlayerPositions(states[0].players, json)
    states[0].players = reorganizePlayers(states[0].players)

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
      newState.skipFromReplay = false

      const resetPlayerValues = () => {
        newState.players.forEach((player) => {

          if(player.actionDescription === "Fold") {
            player.actionDescription = "Folded"
          }

          if(player.actionDescription !== "Folded") {
            player.actionDescription = ""
          }

          player.value = 0
        })
      }

      switch (eventType) {
        case 0:
          //Check
          player.actionDescription = "Check"
          player.value = 0
          break
        case 2:
          //Small blind
          player.actionDescription = "BB"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 3:
          //Big blind
          player.actionDescription = "SB"
          player.stack = previousStack - (value - previousValue)
          player.value = value
          break
        case 6:
          //Straddle
          player.actionDescription = "Straddle"
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

          resetPlayerValues()
          break
        case 10:
          //Collect pot          
          resetPlayerValues()
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
          resetPlayerValues()
          player.actionDescription = "Reveal cards"
          newState.skipFromReplay = true
          break
        case 14:
          //Run-it-twice decision
          // var approved = event.payload.approved === true ? "approved" : "not approved"
          // newState.players.forEach((player) => {
          //   player.actionDescription = `run it twice ${approved}`
          //   player.value = 0
          // })
          newState.skipFromReplay = true
          break
        case 15:
          //Hand finished
          // newState.players.forEach((player) => {
          //   player.actionDescription = "Hand finished"
          //   player.value = 0
          // })
          newState.skipFromReplay = true
          break
        case 16:
          //Uncalled bet
          //Player has raised and others folded -> player takes the raise amount over call back
          player.actionDescription = "Return uncalled bet"
          player.value = value
          player.stack += value
          newState.skipFromReplay = true
          break
        default:
          console.log('Unknown event type:', eventType)
          setWarningMessage("Unknown action type. Please send the URL to Jussi for investigation.")
          break
      }

      newState.pot = totalMoney - newState.players.reduce((sum, player) => sum + player.stack, 0)
      states.push(newState)
    })

    // console.log("Setting gameStates with ", states)
    setGameStates(states)
  }

  const nextState = () => {
    let newIndex = currentIndex + 1;
    while (newIndex < gameStates.length) {
      if (!gameStates[newIndex].skipFromReplay) {
        setCurrentIndex(newIndex);
        return;
      }
      newIndex++;
    }
    setCurrentIndex(currentIndex);
  }

  const previousState = () => {
    let newIndex = currentIndex - 1;
  
    while (newIndex >= 0) {
      if (!gameStates[newIndex].skipFromReplay) {
        setCurrentIndex(newIndex);
        return;
      }
      newIndex--;
    }
    
    setCurrentIndex(0);
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
    if(viewOnly) {
      setCurrentIndex(data.puzzlePoint || 0)
    }
  }, [data])

  return (
    <div className="replayer">
      {currentState ? (
        <>
          <Players gameState={currentState} showCards={showCards} />
          <HandBrowser gameState={currentState} nextState={nextState} previousState={previousState} canUserPressNext={canUserPressNext} />
          <Boards gameState={currentState} finalBoard={gameStates[gameStates.length - 1].board} />
        </>
      ) :
      (
        <></>
      )}
      
      {warningMessage && <WarningMessage warningMessage={warningMessage}/>}
    </div>
  )
}

const NavigateButton = ({ onNavigateClick, isVisible, isNext }) => {

  return (    
    <button onClick={() => onNavigateClick()} className={classNames({hidden: !isVisible}, 'handBrowserItem')} >
       {isNext ? 
        <TbPlayerTrackNext size={40} color="white"/> : 
        <TbPlayerTrackPrev size={40} color="white"/>}
    </button>
  )
}

const HandBrowser = ({gameState, nextState, previousState, canUserPressNext}) => {
  return (
    <div className={"handBrowser"}>
      <NavigateButton onNavigateClick={previousState} isVisible={true} isNext={false}/>
      <Pot gameState={gameState} />
      <NavigateButton onNavigateClick={nextState} isVisible={canUserPressNext()} isNext={true}/>
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
    <div className={classNames('pot', 'handBrowserItem')}>
      <p>POT  </p>
      <p>{gameState.pot}</p>
    </div>
  )
}

const Boards = ({ gameState, finalBoard }) => {
  //We might have two boards if run-it-twice
  const board1 = gameState?.board?.slice(0, 5) || [];
  const board2 = gameState?.board?.slice(5) || [];

  return (
    <div className="boards">
      <Board board={board1} isFirst={true} finalBoard={finalBoard} />
      <Board board={board2} isFirst={false} finalBoard={finalBoard} />
    </div>
  )
}

const Board = ({ board, isFirst, finalBoard }) => {
  if (!board) {
    return null
  }

  let adjustedBoard = [...(board || [])];
  if (!isFirst) {
    //Let's place the revealed card in the right position, 
    //which depends on the total number of revealed cards and current revealed cards
    
    const totalOpenCards = finalBoard.length - 5
    //Possible second board configs:
    //  XXX X C   = one card
    if(totalOpenCards === 1) {
      adjustedBoard.unshift("Zz")
      adjustedBoard.unshift("Zz")
      adjustedBoard.unshift("Zz")
      adjustedBoard.unshift("Zz")
    }
    
    //  XXX C C   = two cards
    if(totalOpenCards === 2) {
      adjustedBoard.unshift("Zz")
      adjustedBoard.unshift("Zz")
      adjustedBoard.unshift("Zz")
      while(adjustedBoard.length < 5){
        adjustedBoard.push("Zz");
      }
    }
    
    //  CCC C C   = five cards
    if(totalOpenCards === 5) {
      while(adjustedBoard.length < 5){
        adjustedBoard.push("Zz");
      }
    }
  } else {
    while (adjustedBoard.length < 5) {
      adjustedBoard.push("Zz");
    }
  }

  return (
    <div className="board">
      <div className="flop">
        {adjustedBoard.slice(0, 3).map((card, index) => (
          <Card key={index} card={card} showCards={true} big={true} />
        ))}
      </div>
      <div className="turn">
        {adjustedBoard[3] && <Card card={adjustedBoard[3]} showCards={true} big={true} />}
      </div>
      <div className="river">
        {adjustedBoard[4] && <Card card={adjustedBoard[4]} showCards={true} big={true} />}
      </div>
    </div>
  )
}

const Players = ({ gameState, showCards }) => {
  return (
    <div className="players">
      <ul>      
        {gameState?.players?.map(player => {
          return (
            <Player 
              player={player}
              showCards={showCards}
              key={player.id}
            />
          )
        })}
      </ul>
    </div>
  )
}

const Player = ({ player: { name, hand, stack, value, actionDescription, seat, position }, showCards }) => {

  var playerPos = position ? position : ""

  return(
    <div className={classNames("player", { transparent: actionDescription === "Folded" || actionDescription === "Fold" })}>
      <p className="playerItem">{name.slice(0, 7)}</p>
      <div className="stackItem">
        <p>
          ({stack})
        </p>
        <p>
          {playerPos}
        </p>
      </div>
      <Hand hand={hand} showCards={showCards(seat)}/>
      <p className="actionItem">{actionDescription} {value ? value : ""}</p>
    </div>
  )
}

const Hand = ({ hand, showCards }) => {

  if(!hand) {
    hand = ["Xx", "Xx"]
  }

  return(
    <div className={classNames('hand', 'playerItem')}>
      {hand.map((card, index) => (
        <Card key={index} card={card} showCards={showCards}/>
      ))}
    </div>
  )
}

export default PokerReplayer