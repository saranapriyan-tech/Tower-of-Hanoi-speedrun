const mongoose = require('mongoose');

// The rulebook: every score document MUST follow this shape
const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[A-Za-z0-9 _-]+$/ // same rule as your frontend sanitizeUsername
  },
  diskCount: {
    type: Number,
    required: true,
    min: 3,
    max: 12
  },
  timeTaken: {
    type: Number, // milliseconds
    required: true,
    min: 0
  },
  moveCount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Turn the schema into a Model called "Score" -> collection "scores"
const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
