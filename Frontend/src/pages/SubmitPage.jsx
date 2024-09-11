import { useState, useEffect, useContext } from 'react'
import puzzleService from '../services/puzzles'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'
import handService from '../services/pokerNowHand'
import { HandContext } from '../context/HandProvider'

const SubmitPage = () => {

  const [data, setHandJson] = useState(null)
  const [votingOptions, setVotingOptions] = useState(null)
  const { currentIndex, setCurrentIndex } = useContext(HandContext)

  const handleToggleChange = (options) => {
    setVotingOptions(options)
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

  const handleUrlInput = async (url) => {

    //TODO delete command

    const handId = getHandIdentifier(url)  

    if (!handId) {
      console.error("Invalid URL format.")
      window.alert("Invalid URL format. This should be a unique hand URL from PokerNow.")
      return
    }

    try {
      // Use the handService to fetch hand data
      const data = await handService.fetchHandData(handId)
      console.log("Fetched JSON data from backend:", data)
      setHandJson(data)
      setCurrentIndex(0)
    } catch (error) {
      window.alert("Error fetching JSON from backend. URL should be a unique hand from PokerNow", error)
    }
  }

  const saveHandToDatabase = (puzzlePoint, heroSeat) => {
    //puzzlePoint is the point in hand meant for puzzle.
    data.puzzlePoint = puzzlePoint
    data.heroSeat = heroSeat
    data.options = votingOptions
    console.log("Saving hand: ", data)
    console.log("Saving using options:", data.options)
    console.log("saving hand to database with puzzlepoint", puzzlePoint)

    puzzleService.submit(data)
      .then(response => {
        window.alert("Submission succeeded! Hand saved to database")
        console.log("Submission response:", response)
      })
      .catch(error => {
        window.alert("Submission failed! Please try again.")
        console.error("Error during submission:", error)
      })
  }

  const determineHeroSeat = () => {    
    //Note that the gameStates array has one extra state (initial state), which is why
    //we use "currentIndex" instead of "currentIndex + 1" here.
    if(data.events.length <= currentIndex) {
      window.alert("This is the last action.")
      return null
    }
    const nextAction = data.events[currentIndex].payload
    console.log("Current event: ", nextAction)
    const heroSeat = nextAction.seat
    if(!heroSeat) {
      window.alert("Next game phase doesn't include a player action.")
      //TODO: this still allows some phases, such as "collect pot" where one could
      //submit a hand in theory - though it wouldn't make sense to do thus
      return null
    }
    const heroName = data.players.find(p => p.seat === heroSeat).name
    console.log("Hero name:", heroName)
    console.log("Current seat:", heroSeat)
    return heroSeat
  }

  const submitHand = () => {

    const userConfirmed = window.confirm("Do you want to submit this spot in the hand?")

    if(!userConfirmed) {
      return
    }

    const handPoint = currentIndex

    const heroSeat = determineHeroSeat()
    if(!heroSeat) return
    console.log("Submitting hand")
    saveHandToDatabase(handPoint, heroSeat)
  }

  return (
    <div className="pageContent">      
      <HandInputField handleUrlInput={handleUrlInput}/>     
      {data && (
        <>
          <PokerReplayer data={data} viewOnly={false} hasVoted={true}/>
          <OptionToggles handleToggleChange={handleToggleChange} />
          <Submit submitHand={submitHand} />
        </>
      )}
    </div>
  )
}

const Submit = ({ submitHand }) => {
  return(
    <div className="submit">
      <button onClick={() => submitHand()}>Submit</button>      
    </div>
  )  
}

const HandInputField = ({ handleUrlInput }) => {
  const [url, setUrl] = useState("")

  const handleURL = (event) => {
    event.preventDefault()
    handleUrlInput(url)
  }

  return (
    <div className="url">
      <p>Please provide a PokerNow hand-history link</p>
      <div>        
        <form onSubmit={handleURL} className="urlForm">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            className="urlField"
            />
          <button type="submit" className="urlButton">SET</button>
        </form>
      </div>
    </div>
  )
}

const OptionToggles = ({ handleToggleChange }) => {
  const options = ['Fold', 'Check', 'Call', 'Bet', 'Raise']
  
  const [activeOptions, setActiveOptions] = useState(options)

  const initialize = () => {
    setActiveOptions(options)
    const formattedOptions = options.map((opt) => ({ action: opt, votes: 0 }))
    handleToggleChange(formattedOptions)
  }

  const handleToggle = (option) => {
    let updatedOptions
    if (activeOptions.includes(option)) {
      updatedOptions = activeOptions.filter((opt) => opt !== option)
    } else {
      updatedOptions = [...activeOptions, option]
    }
    setActiveOptions(updatedOptions)
    
    const formattedOptions = updatedOptions.map((opt) => ({ action: opt, votes: 0 }))
    handleToggleChange(formattedOptions)
  }

  useEffect(() => {
    initialize()
  }, [])
  console.log("Options:", activeOptions)
  return (
    <div className="actionsParent">
      <p>Deselect unnecessary options</p>
      <div className="actions">
        {options.map((option) => (
          <div key={option} className="action">
            <label className={activeOptions.includes(option) ? 'toggleActive' : ''}>
              <input
                type="checkbox"
                checked={activeOptions.includes(option)}
                onChange={() => handleToggle(option)}
              />
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubmitPage