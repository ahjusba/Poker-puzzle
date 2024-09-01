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

//Proxy for PokerNow handhistories, bypassing CORS
app.get('/api/hand-replayer/hand/:handId', async (req, res) => {
  const { handId } = req.params; // Extract the hand ID from the request params
  console.log("Fetching hand form PokerNow with ID", handId)
  const apiUrl = `https://www.pokernow.club/api/hand-replayer/hand/${handId}`; // Construct the API URL

  try {
    // Dynamically import node-fetch
    const { default: fetch } = await import('node-fetch')

    // Fetch the JSON data from the external API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error fetching data from external API: ${response.statusText}`);
    }

    const data = await response.json(); // Parse the response as JSON

    res.json(data); // Send the JSON data back to the frontend
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

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
  let date = request.params.id
  date = "240815" //Temporary
  Puzzle.find({ date: date })
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

app.put('/api/puzzles/:id/vote', (request, response, next) => {
  const { id: puzzleId } = request.params
  const { voteId } = request.body
  console.log(`Searching for document with puzzle id ${puzzleId} and voteId ${voteId}`)

  Puzzle.findOneAndUpdate(
    {
      _id: puzzleId,
      'options._id': voteId
    },
    {
      $inc: { 'options.$.votes': 1 }
    },
    { new: true }
  )
  .then(updatedPuzzle => {
    console.log("UpdatedPuzzle: ", updatedPuzzle)
    if (updatedPuzzle) {
      response.json(updatedPuzzle);
    } else {      
      response.status(404).end();
    }
  })
  .catch(error => {
    next(error);
  });
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
