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
app.get('/api/pokerNowHand/:handId', async (req, res) => {
  const { handId } = req.params
  console.log("HandID: ", handId)
  var apiUrl = ""
  if(handId.includes('-')) {
    apiUrl = `https://media.pokernow.club/shared-hands/${handId}.json`
  } else {
    apiUrl = `https://www.pokernow.club/api/hand-replayer/hand/${handId}`
  }  
  console.log("Fetching hand form PokerNow with URL", apiUrl)

  try {
    // Dynamically import node-fetch
    const { default: fetch } = await import('node-fetch')

    // Fetch the JSON data from the external API
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Error fetching data from external API: ${response.statusText}`)
    }
    console.log("Response:", response)
    const data = await response.json() // Parse the response as JSON
    console.log("Fetched data:", JSON.stringify(data, null, 2))

    res.json(data)
  } catch (error) {
    console.error("Error fetching data:", error)
    res.status(500).json({ error: 'Failed to fetch data from external API' })
  }
})

app.get('/', (request, response) => {
  response.send('<h1>TODO: infopage</h1>')
})

app.get('/api/puzzles', (request, response) => {
  console.log("Getting latest puzzle")
  Puzzle.findOne({})
    .sort({ puzzle_id: -1 }) // Sort by 'id' in descending order
    .then(latestPuzzle => {
      if (latestPuzzle) {
        response.json({ ...latestPuzzle.toObject(), isLatest: true })
      } else {
        response.status(404).json({ message: 'No puzzles found' })
      }
    })
    .catch(error => {
      console.error('Error fetching the latest puzzle:', error)
      response.status(500).json({ error: 'Internal server error' })
    })
})


app.get('/api/puzzles/:id', async (request, response, next) => {
  const puzzle_id = Number(request.params.id)

  try {
    const puzzle = await Puzzle.findOne({ puzzle_id: puzzle_id }).exec()

    if (puzzle) {
      console.log(`Found puzzle id ${puzzle.puzzle_id} with type of ${typeof(puzzle.puzzle_id)}`)

      // Check if there is any puzzle with a greater id
      const existsGreaterId = await Puzzle.exists({ puzzle_id: { $gt: puzzle_id } })
      const isLatest = !existsGreaterId

      console.log("IsLatest: ", isLatest)
      response.json({ ...puzzle.toObject(), isLatest: isLatest })
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

app.post('/api/puzzles', (request, response) => {
  const newPuzzleData = request.body
  console.log(`POSTing new puzzle with data ${newPuzzleData}`)

  Puzzle.find({})
    .then(puzzles => {    
      //Determine the highest id so far
      let highestPuzzleId = 0
      puzzles.forEach((puzzle) => {
        const puzzle_id = puzzle.puzzle_id
        if(puzzle_id && puzzle_id > highestPuzzleId) {
          highestPuzzleId = puzzle_id
        }
      })

      // Create a new puzzle instance with the next ID
      const newPuzzle = new Puzzle({
        puzzle_id: Number(highestPuzzleId + 1),
        ...newPuzzleData
      })

      return newPuzzle.save()
    })
    .then(savedPuzzle => {
      response.status(201).json(savedPuzzle)
    })
    .catch(error => {
      console.error('Error saving the new puzzle:', error)
      response.status(500).json({ error: 'Internal server error' })
    })
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
      response.json(updatedPuzzle)
    } else {      
      response.status(404).end()
    }
  })
  .catch(error => {
    next(error)
  })
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
