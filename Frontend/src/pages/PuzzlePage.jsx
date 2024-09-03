import { useState, useEffect } from 'react'
import puzzleService from '../services/puzzles'
import '../index.css'

const PuzzlePage = () => {

  const [dailyPuzzle, setDailyPuzzle] = useState([])
  const [hasVoted, setHasVoted] = useState(false)

  const getDate = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2) // Get last 2 digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Get month and ensure it's 2 digits
    const day = date.getDate().toString().padStart(2, '0') // Get day and ensure it's 2 digits
    return `${year}${month}${day}`
  }

  const date = getDate() //format YYMMDD

  useEffect(() => {
    //Has the user voted already today -> affects rendering
    const storedDate = localStorage.getItem('voteDate')
    const votedStatus = localStorage.getItem('hasVoted') === 'true'

    if(storedDate === date) {
      setHasVoted(votedStatus)
    } else {
      localStorage.removeItem('voteDate')
      localStorage.removeItem('hasVoted')
      setHasVoted(false)
    }

    //Retrieve today's puzzle
    console.log("Getting puzzle for date ", date)
    puzzleService
      .getId(date)
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
        localStorage.setItem('voteDate', date)
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
      <Title puzzle={dailyPuzzle}/>
      <OptionButtons handleClick={handleButtonClick} optionButtons={dailyPuzzle?.options || []} hasVoted={hasVoted} />
    </div>
  )
}

const Title = ({puzzle}) => {
  return (
    <h1>
      {puzzle.puzzleDescription}
    </h1>
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