import { useState, useEffect } from 'react'
import puzzlesService from '../services/puzzles'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'
import handService from '../services/pokerNowHand'

const SubmitPage = () => {

  const [dailyPuzzle, setDailyPuzzle] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [handJson, setHandJson] = useState(null)

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
    puzzlesService
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
    puzzlesService
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

  // const handleButtonClick = (optionButtonId) => {
  //   updateVotes(optionButtonId)
  // }

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
      console.error("Invalid URL format.")
      return
    }
    console.log("Hand identifier:", handId)

    try {
      // Use the handService to fetch hand data
      const data = await handService.fetchHandData(handId)
      console.log("Fetched JSON data from backend:", data)
      setHandJson(data)
    } catch (error) {
      console.error("Error fetching JSON from backend:", error)
    }
  }

  return (
    <div>
      <HandInputField handleHandSubmit={handleHandSubmit} />
      {handJson && <PokerReplayer data={handJson}/>}
      {/* <Title puzzle={dailyPuzzle}/>
      <OptionButtons handleClick={handleButtonClick} optionButtons={dailyPuzzle?.options || []} hasVoted={hasVoted} /> */}
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

// const Title = ({puzzle}) => {
//   return (
//     <h1>
//       {puzzle.puzzleDescription}
//     </h1>
//   )
// }

// const OptionButtons = ({ handleClick, optionButtons, hasVoted }) => {
//   return (
//     <ul>
//       {optionButtons.map(optionButton => {
//         return (
//           <OptionButton 
//             handleClick={handleClick} 
//             action={optionButton.action} 
//             sizing={optionButton.sizing} 
//             hasVoted={hasVoted}
//             votes={optionButton.votes}
//             id={optionButton.id}
//             key={optionButton.id}
//           />
//         )
//       })}
//     </ul>
//   )
// }

// const OptionButton = ({handleClick, action, sizing, hasVoted, votes, id}) => {
//   return (
//     <div className="voteResultBox">
//       {hasVoted ? (        
//         <p>{action} <br></br>{sizing}votes: {votes}</p>
//       ) : (
//         <button onClick={() => handleClick(id)}>
//           {action} {sizing}
//         </button>
//       )}
//     </div>
//   )
// }

export default SubmitPage