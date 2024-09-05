import { useState, useEffect } from 'react'
import puzzleService from '../services/puzzles'
import { useNavigate, useParams } from 'react-router-dom'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'

const PuzzlePage = () => {
  const { id } = useParams()
  const [puzzle, setPuzzle] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()
  console.log("Has voted: ", hasVoted)
  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        const puzzle = id ? await puzzleService.getId(id) : await puzzleService.getLatest()
        if (puzzle) {
          console.log(`Fetched puzzle:`, puzzle)
          setPuzzle(puzzle)
        } else {
          console.log(`Puzzle not found with id ${id}`)
          setNotFound(true)
        }
      } catch (error) {
        console.log("Failed to fetch the puzzle:", error)
        setNotFound(true)
      }
    }
  
    fetchPuzzle()
  }, [id])
  
  useEffect(() => {
    if (notFound) {
      const timer = setTimeout(() => {        
        navigate('/puzzle')
        setNotFound(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notFound])  

  useEffect(() => {
    const votedPuzzles = JSON.parse(localStorage.getItem('votedPuzzles')) || []

    if (puzzle && votedPuzzles.includes(puzzle.puzzle_id)) {
      setHasVoted(true)
    } else {
      setHasVoted(false)
    }
  }, [puzzle])

  const updateLocalStorage = (puzzle_id) => {
    const storedArray = JSON.parse(localStorage.getItem('votedPuzzles')) || []  
    if (!storedArray.includes(puzzle_id)) {
      storedArray.push(puzzle_id)
      localStorage.setItem('votedPuzzles', JSON.stringify(storedArray))
    }
  }

  const updateVotes = (voteId) => {
    puzzleService
      .vote(puzzle.puzzle_id, voteId)
      .then(response => {
        console.log("Vote response: ", response)
        setPuzzle(response)
        updateLocalStorage(puzzle.puzzle_id)
      })
      .catch(error => {
        console.log("error: ", error.response.data.error)
      })
  }

  const handleNavigateClick = (nextHand) => {
    if(nextHand){
      console.log("Click next hand")
      const nextPuzzleId = puzzle.puzzle_id + 1
      navigate(`/puzzle/${nextPuzzleId}`)
    } else {
      console.log("Click previous hand")
      const previousPuzzleId = Math.max(0, puzzle.puzzle_id - 1)
      navigate(`/puzzle/${previousPuzzleId}`)
    }
  }

  const handleButtonClick = (optionButtonId) => {
    updateVotes(optionButtonId)
  }
  
  if(notFound) return <p>Puzzle not found. Redirecting...</p>
  if(!puzzle) return <p>Loading...</p>

  return (
    <div>
      { puzzle.puzzle_id !== 0 && <NavigateButton text="previous hand" onNavigateClick={handleNavigateClick} nextHand={false} />}
      { !puzzle.isLatest && <NavigateButton text="next hand" onNavigateClick={handleNavigateClick} nextHand={true} />}
      <Title puzzle_id={puzzle.puzzle_id} />
      <PokerReplayer data={puzzle} saveHandToDatabase={null} viewOnly={true} hasVoted={false}/>
      <OptionButtons handleClick={handleButtonClick} optionButtons={puzzle.options || []} hasVoted={hasVoted} />
    </div>
  )
}

const NavigateButton = ({ text, onNavigateClick, nextHand }) => {
  return (
    <button onClick={() => onNavigateClick(nextHand)}>{text}</button>
  )
}
const Title = ({ puzzle_id }) => {
  return (
    <h1>Hand #{puzzle_id}</h1>
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
            hasVoted={hasVoted}
            votes={optionButton.votes}
            id={optionButton._id}
            key={optionButton._id}
          />
        )
      })}
    </ul>
  )
}

const OptionButton = ({handleClick, action, hasVoted, votes, id}) => {  
  return (
    <div className="voteResultBox">
      {hasVoted ? (        
        <p>{action} votes: {votes}</p>
      ) : (
        <button onClick={() => handleClick(id)}>
          {action}
        </button>
      )}
    </div>
  )
}

export default PuzzlePage