const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))


//POST url status responsetime person
morgan.token('person', function (req) { return JSON.stringify(req.body) })

let buttons = [
  {
    action: "fold",
    sizing: "0",
    id:"0"
  },
  {
    action: "call",
    sizing: "0",
    id:"1"
  },
  {
    action: "raise",
    sizing: "60",
    id:"2"
  },
]

app.get('/', (request, response) => {
  response.send('<h1>ello World!</h1>')
})

app.get('/api/buttons', (request, response) => {
  response.json(buttons)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)