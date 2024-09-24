// store.route.js
const express = require('express');
const router = express.Router();
const { StoreRepository, PurchasesRepository } = require('../database');

router.get('/items', async (req, res) => {
  try {
    const items = await StoreRepository.getAllItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching store items:', error);
    res.status(500).send('Failed to retrieve store items.');
  }
});

router.post('/purchase', async (req, res) => {
  const { items } = req.body; 

  if (!req.session.user) {
    return res.status(401).send('You must be logged in to make a purchase.');
  }

  try {
    let totalAmount = 0;

    for (const item of items) {
      // Removes items quantity from my database
      const dbItem = await StoreRepository.getItemById(item.id);
      if (dbItem.quantity < item.quantity) {
        return res.status(400).send(`Not enough stock for item: ${dbItem.name}`);
      }

      // Removes the amount the customer buys
      await StoreRepository.updateItemQuantity(item.id, item.quantity);

      // Calculates the amount
      totalAmount += (dbItem.price / 100) * item.quantity;
    }
    
    await PurchasesRepository.recordPurchase(req.session.user.id, totalAmount, items);

    res.status(200).send('Purchase successful.');
  } catch (error) {
    console.error('Error during purchase:', error);
    res.status(500).send('Failed to complete the purchase.');
  }
});

module.exports = router;
