require('dotenv').config()
const mongoose = require('mongoose')
const Puzzle = require('./models/puzzle')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)

const puzzle = new Puzzle({
  date: 240814,
  puzzleDescription: "This is puzzle description",
  options: [
    { action: "fold" },
    { action: "call" },
    { action: "raise", sizing: 6 },
  ]
})

puzzle.save().then(result => {
  console.log('Puzzle saved!')
  mongoose.connection.close()
})