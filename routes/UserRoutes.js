const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const router = express.Router()
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Get all users
router.get('/', async (req, res) => {
    try{
        const data = await User.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get user by ID
router.get('/:id', async (req, res) => {
    try{
        const data = await User.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Create a new user
router.post('/', async (req, res) => {
    const data = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})                  

// Update existing user by ID
router.put('/:id', async (req, res) => {
    try {
        email = req.body.email;
        username = req.body.username;
        const userToUpdate = await User.findById(req.params.id);

        if (email === undefined || email === null || email === "" || username === undefined || username === null || username === "") {
            return res.status(400).json({ error: 'Username and email are required' });
        } else if (userToUpdate === null) {
            return res.status(400).json({ error: 'User not found' });
        } else if (userToUpdate.email === email && userToUpdate.username === username) {
            return res.status(400).json({ error: 'No changes made' });
        } else if (userToUpdate.email === email && userToUpdate.username !== username && (req.body.password === undefined || req.body.password === null || req.body.password === "")) {
            const updatedUser = await User.updateOne(
                { _id: req.params.id },

                {
                    $set: {
                        username: req.body.username,
                    }
                }
            );
            res.status(201).json(updatedUser);
        } else if (userToUpdate.email === email && userToUpdate.username !== username && (req.body.password !== undefined || req.body.password !== null || req.body.password !== "")) {
            const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
            const updatedUser = await User.updateOne(
                { _id: req.params.id },

                {
                    $set: {
                        username: req.body.username,
                        password: password
                    }
                }
            );
            res.status(201).json(updatedUser);
        } else if (userToUpdate.email !== email && userToUpdate.username === username && (req.body.password === undefined || req.body.password === null || req.body.password === "")) {
            const updatedUser = await User.updateOne(
                { _id: req.params.id },

                {
                    $set: {
                        email: req.body.email,
                    }
                }
            );
            res.status(201).json(updatedUser);
        } else if (userToUpdate.email !== email && userToUpdate.username === username && (req.body.password !== undefined || req.body.password !== null || req.body.password !== "")) {
            const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
            const updatedUser = await User.updateOne(
                { _id: req.params.id },

                {
                    $set: {
                        email: req.body.email,
                        password: password
                    }
                }
            );
            res.status(201).json(updatedUser);
        } else {
            if(userToUpdate.email !== email && userToUpdate.username !== username && (req.body.password === undefined || req.body.password === null || req.body.password === "")) {
                const updatedUser = await User.updateOne(
                    { _id: req.params.id },
                    
                    {
                      $set: {
                        email: req.body.email,
                        username: req.body.username,
                      }
                    }
                  );
                  res.status(201).json(updatedUser);
            } else {
                const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                const updatedUser = await User.updateOne(
                  { _id: req.params.id },      
                  {
                    $set: {
                      username: req.body.username,
                      email: req.body.email,
                      password: password
                    }
                  }
                );
                res.status(201).json(updatedUser);
            }
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Delete existing user by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findByIdAndDelete(id)
        res.send(`The user has been deleted.`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


// Log in user and return user data
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne ({ email: req.body.email });
        if (user) {
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (validPassword) {
                const payload = user.cleanup();
                const accessToken = generateAccessToken(payload, JWT_SECRET);
                res.status(200).send({
                  message: "User authenticated",
                  accessToken,
                });
            } else {
                res.status(400).json({ message: 'Invalid password' });
            }
        } else {
            res.status(400).json({ message: 'Invalid email' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Cannot login user right now, try again later' });
    }
});

function generateAccessToken(payload, secret) {
    return jwt.sign(payload, secret);
}

module.exports = router;