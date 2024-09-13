const express = require('express');
const router = express.Router();
const { StoreRepository } = require('../database');  // Import StoreRepository from the database folder

// Route to get all items from the store
router.get('/items', async (req, res) => {
  try {
    const items = await StoreRepository.getAllItems();  // Fetch all store items using StoreRepository
    res.json(items);  // Send the items as a JSON response
  } catch (error) {
    console.error('Error fetching store items:', error);
    res.status(500).send('Failed to retrieve store items.');
  }
});

// Route to add a new item to the store
router.post('/items', async (req, res) => {
  const { name, description, price, quantity } = req.body;
  try {
    const conn = await StoreRepository.addItem(name, description, price, quantity);
    res.status(201).send('Item added successfully.');
  } catch (error) {
    console.error('Error adding item to the store:', error);
    res.status(500).send('Failed to add item.');
  }
});

// Route to update an existing item in the store
router.put('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  const { name, description, price, quantity } = req.body;
  try {
    await StoreRepository.updateItem(itemId, name, description, price, quantity);
    res.send('Item updated successfully.');
  } catch (error) {
    console.error('Error updating item in the store:', error);
    res.status(500).send('Failed to update item.');
  }
});

// Route to delete an item from the store
router.delete('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    await StoreRepository.deleteItem(itemId);
    res.send('Item deleted successfully.');
  } catch (error) {
    console.error('Error deleting item from the store:', error);
    res.status(500).send('Failed to delete item.');
  }
});

module.exports = router;
