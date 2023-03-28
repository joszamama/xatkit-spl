const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/xatkit-spl');

router.delete('/database/clean', async (req, res) => {
  try {
    const verify = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    if (verify.id && verify.id === process.env.ADMIN_ID) {
      try {
        let collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(async (collection) => {
          if (collection.name !== 'users') {
            await mongoose.connection.db.dropCollection(collection.name);
          } else {
            let users = await mongoose.connection.db.collection('users');
            users.deleteMany({
              role: { $ne: 'admin' }
            });
          }
        });
        res.status(200).send('Database cleaned');
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      res.status(401).send("Only administrators can clean the database");
    }
  } catch (error) {
    res.status(500).send("Token is invalid");
  }
});

module.exports = router;