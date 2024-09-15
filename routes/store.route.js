// store.route.js
const express = require('express');
const router = express.Router();
const { StoreRepository } = require('../database');

// GET /api/store/items - Retrieve all store items
router.get('/items', async (req, res) => {
  try {
    const items = await StoreRepository.getAllItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching store items:', error);
    res.status(500).send('Failed to retrieve store items.');
  }
});

//Maybe in the future I can implement POST: add new item, PUT: update an item, and DELETE: delete an item

module.exports = router;
