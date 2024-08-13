import { useState, useEffect } from 'react'
import buttonService from './services/actionButtons'

const App = () => {

  const [actionButtons, setActionButtons] = useState([])
  const [timesClicked, setTimesClicked] = useState(0)

  useEffect(() => {
    buttonService
      .getAll()
      .then(initialButtons => {
        console.log("Promise fulfilled with data: ", initialButtons)
        setActionButtons(initialButtons)
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
      <ActionButtons handleClick={handleButtonClick} actionButtons={actionButtons} />
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

const ActionButtons = ({ handleClick, actionButtons }) => {
  return (
    <ul>
      {actionButtons.map(actionButton => {
        return (
          <ActionButton 
            handleClick={handleClick} 
            action={actionButton.action} 
            sizing={actionButton.sizing} 
            key={actionButton.id}
          />
        )
      })}
    </ul>
  )
}

const ActionButton = ({handleClick, action, sizing}) => {
  return (
    <button onClick={handleClick}>
      {action} {sizing}
    </button>    
  )
}

export default App