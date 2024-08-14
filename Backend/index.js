require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Puzzle = require('./models/puzzle')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))


//POST url status responsetime person
morgan.token('person', function (req) { return JSON.stringify(req.body) })

app.get('/', (request, response) => {
  response.send('<h1>TODO: infopage</h1>')
})

app.get('/api/puzzles', (request, response) => {
  Puzzle.find({}).then(puzzles => {
    response.json(puzzles)
  })
})

app.get('/api/puzzles/:id', (request, response, next) => {
  console.log("Getting puzzle with date", request.params.id)
  Puzzle.find({ date: request.params.id })
    .then(puzzles => {
      if (puzzles && puzzles.length > 0) {
        console.log(puzzles)
        response.json(puzzles[0])
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))
})


const PORT =  process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)
