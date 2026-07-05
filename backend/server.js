require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const scoreRoutes = require('./routes/scores');

const app = express();

// Middleware
app.use(cors());          // allows your frontend (different domain) to call this API
app.use(express.json());  // lets Express understand JSON in req.body

// Routes
app.use('/api/scores', scoreRoutes);

// Simple test route to confirm the server is alive
app.get('/', (req, res) => {
  res.send('Hanoi backend is running');
});

// Connect to MongoDB, then start the server only if that succeeds
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
