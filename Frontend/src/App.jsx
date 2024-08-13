import { useState, useEffect } from 'react'
import buttonService from './services/actionButtons'

const App = () => {

  const [actionButtons, setActionButtons] = useState([])
  const [timesClicked, setTimesClicked] = useState(0)

  useEffect(() => {
    console.log("Buttons1: ", actionButtons)
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
    
  console.log("Buttons2: ", actionButtons)
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
  console.log("Buttons now: ", actionButtons)
  return (
    <ul>
      {actionButtons.map(actionButton => {
        {console.log("Button: ", actionButton, actionButton.sizing, actionButton.action)}
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