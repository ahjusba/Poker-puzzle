import { useState, useEffect } from 'react'
import puzzleService from '../services/puzzles'
import '../index.css'
import PokerReplayer from '../components/pokerReplayer'
import handService from '../services/pokerNowHand'

const SubmitPage = () => {

  const [handJson, setHandJson] = useState(null)

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
    } catch (error) {
      window.alert("Error fetching JSON from backend. URL should be a unique hand from PokerNow", error)
    }
  }

  const saveHandToDatabase = (puzzlePoint, heroSeat) => {
    //puzzlePoint is the point in hand meant for puzzle.
    handJson.puzzlePoint = puzzlePoint
    handJson.heroSeat = heroSeat
    console.log("saving hand to database with puzzlepoint", puzzlePoint)

    puzzleService.submit(handJson)
      .then(response => {
        window.alert("Submission succeeded! Hand saved to database")
        console.log("Submission response:", response)
      })
      .catch(error => {
        window.alert("Submission failed! Please try again.")
        console.error("Error during submission:", error)
      })
  }

  return (
    <div>
      <p>Please provide a PokerNow hand-history link</p>
      <HandInputField handleUrlInput={handleUrlInput}/>
      {handJson && <PokerReplayer data={handJson} saveHandToDatabase={saveHandToDatabase} viewOnly={false} hasVoted={true}/>}
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
    <form onSubmit={handleURL}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        />
      <button type="submit">Set URL</button>
    </form>
  )
}

export default SubmitPage