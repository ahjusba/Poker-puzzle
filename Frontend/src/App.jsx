import { useState, useEffect } from 'react'
import puzzlesService from './services/puzzles'

const App = () => {

  const [dailyPuzzle, setDailyPuzzle] = useState([])
  const [timesClicked, setTimesClicked] = useState(0)

  const getDate = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month and ensure it's 2 digits
    const day = date.getDate().toString().padStart(2, '0'); // Get day and ensure it's 2 digits
    return `${year}${month}${day}`;
  }

  const date = getDate() //format YYMMDD


  useEffect(() => {
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
    
  const handleButtonClick = () => {
    console.log("Clicked button")
    setTimesClicked(timesClicked + 1)
  }

  return (
    <div>
      <ClickCounter timesClicked={timesClicked}/>
      <OptionButtons handleClick={handleButtonClick} optionButtons={dailyPuzzle?.options || []} />
    </div>
  )
}

const ClickCounter = ({timesClicked}) => {
  return (
    <h1>
      Times clicked: {timesClicked}
    </h1>
  )
}

const OptionButtons = ({ handleClick, optionButtons }) => {
  return (
    <ul>
      {optionButtons.map(optionButton => {
        return (
          <OptionButton 
            handleClick={handleClick} 
            action={optionButton.action} 
            sizing={optionButton.sizing} 
            key={optionButton.id}
          />
        )
      })}
    </ul>
  )
}

const OptionButton = ({handleClick, action, sizing}) => {
  return (
    <button onClick={handleClick}>
      {action} {sizing}
    </button>    
  )
}

export default App