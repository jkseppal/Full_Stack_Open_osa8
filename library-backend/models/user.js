const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  favoriteGenres: [
    {
      type: String
    }
  ]
})

module.exports = mongoose.model('User', schema)