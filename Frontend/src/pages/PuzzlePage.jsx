import { useState, useEffect } from 'react'
import puzzleService from '../services/puzzles'
import { useNavigate, useParams } from 'react-router-dom'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'
import { IoCaretForwardOutline, IoCaretBackOutline } from "react-icons/io5"
import classNames from 'classnames'

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
    <div className="pageContent">      
      <PuzzleBrowser puzzle_id={puzzle.puzzle_id} puzzle={puzzle} onNavigateClick={handleNavigateClick} />
      <PokerReplayer data={puzzle} viewOnly={true} hasVoted={hasVoted}/>
      <OptionButtons handleClick={handleButtonClick} optionButtons={puzzle.options || []} hasVoted={hasVoted} />
    </div>
  )
}

const NavigateButton = ({ onNavigateClick, nextHand, className }) => {
  return (    
    <button onClick={() => onNavigateClick(nextHand)} className={className}>
      {nextHand ? <IoCaretForwardOutline size={40} color="white"/> : <IoCaretBackOutline size={40} color="white"/>}    
    </button>
  )
}

const PuzzleBrowser = ({ puzzle_id, puzzle, onNavigateClick }) => {
  const backIsHidden = puzzle_id === 0
  const forwardIsHidden = puzzle.isLatest

  return (
    <div className="puzzleBrowser">
      <NavigateButton 
        onNavigateClick={onNavigateClick} 
        nextHand={false} 
        className={classNames({ hidden: backIsHidden })}
      />
      <h1>Hand #{puzzle_id}</h1>
      <NavigateButton 
        onNavigateClick={onNavigateClick} 
        nextHand={true} 
        className={classNames({ hidden: forwardIsHidden })} 
      />
    </div>
  )
}

const OptionButtons = ({ handleClick, optionButtons, hasVoted }) => {
  return (
    <ul className="voteOptions">
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
    <>
      {hasVoted ? (
        <button className="voteOption">
          {action} {votes}
        </button>
      ) : (
        <button onClick={() => handleClick(id) } className="voteOption">
          {action}
        </button>
      )}
    </>
  )
}

export default PuzzlePage