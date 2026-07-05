const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Map each ring category to its diskCount range (mirrors script.js ringCategory())
const RING_CATEGORIES = {
  novice:     [3, 4],
  apprentice: [5, 6],
  skilled:    [7, 8],
  expert:     [9, 10],
  master:     [11, 12]
};

// POST /api/scores  -> save a completed speedrun
router.post('/', async (req, res) => {
  try {
    const newScore = new Score({
      username: req.body.username,
      diskCount: req.body.diskCount,
      timeTaken: req.body.timeTaken,
      moveCount: req.body.moveCount
    });

    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/scores?category=apprentice -> leaderboard filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      const range = RING_CATEGORIES[category.toLowerCase()];
      if (!range) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      filter.diskCount = { $gte: range[0], $lte: range[1] };
    }

    const scores = await Score.find(filter).sort({ timeTaken: 1 }).limit(50);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
