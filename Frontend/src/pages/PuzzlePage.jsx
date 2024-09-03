import { useState, useEffect } from 'react'
import puzzleService from '../services/puzzles'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'

const PuzzlePage = () => {

  const [dailyPuzzle, setDailyPuzzle] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    //Retrieve today's puzzle
    console.log("Getting latest puzzle")
    puzzleService
      .getLatest()
      .then(puzzle => {
        console.log("Promise fulfilled with data: ", puzzle)
        setDailyPuzzle(puzzle)
      })
      .catch(error => {
        console.log('Error fetching actionButtons: ', error)
      })
  }, [])    

  const updateVotes = (voteId) => {
    puzzleService
      .vote(dailyPuzzle.id, voteId)
      .then(response => {
        console.log("Vote response: ", response)
        setDailyPuzzle(response)
        setHasVoted(true)
        // localStorage.setItem('voteDate', date)
        localStorage.setItem('hasVoted', 'true')
      })
      .catch(error => {
        console.log("error: ", error.response.data.error)
      })
  }

  const handleButtonClick = (optionButtonId) => {
    updateVotes(optionButtonId)
  }

  return (
    <div>
      { dailyPuzzle && <p>found puzzle</p>}
      { dailyPuzzle && <PokerReplayer data={dailyPuzzle} saveHandToDatabase={null} viewOnly={true}/>}
      {/* <OptionButtons handleClick={handleButtonClick} optionButtons={dailyPuzzle?.options || []} hasVoted={hasVoted} /> */}
    </div>
  )
}

const OptionButtons = ({ handleClick, optionButtons, hasVoted }) => {
  return (
    <ul>
      {optionButtons.map(optionButton => {
        return (
          <OptionButton 
            handleClick={handleClick} 
            action={optionButton.action} 
            sizing={optionButton.sizing} 
            hasVoted={hasVoted}
            votes={optionButton.votes}
            id={optionButton.id}
            key={optionButton.id}
          />
        )
      })}
    </ul>
  )
}

const OptionButton = ({handleClick, action, sizing, hasVoted, votes, id}) => {
  return (
    <div className="voteResultBox">
      {hasVoted ? (        
        <p>{action} <br></br>{sizing}votes: {votes}</p>
      ) : (
        <button onClick={() => handleClick(id)}>
          {action} {sizing}
        </button>
      )}
    </div>
  )
}

export default PuzzlePage