const express = require('express');
const mongoose = require('mongoose');
const Chatbot = require('../models/Chatbot');
const router = express.Router()

// Get all chatbots
router.get('/', async (req, res) => {
    try{
        const data = await Chatbot.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get chatbot by ID
router.get('/:id', async (req, res) => {
    try{
        const data = await Chatbot.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get chatbot by owner
router.get('/owner/:owner', async (req, res) => {
    try{
        const data = await Chatbot.find({owner: req.params.owner});
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Create a chatbot
router.post('/', async (req, res) => {
    intents = req.body.intents.split(',').map(item => item.trim());
    const chatbot = new Chatbot({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        owner: req.body.owner,
        role: req.body.role,
        intents: intents
    })
    try{
        const data = await chatbot.save();
        res.status(201).json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Update a chatbot by ID
router.put('/:id', async (req, res) => {
    if (req.body.intents != null){
        req.body.intents = req.body.intents.split(',').map(item => item.trim());
    }
    try{
        const data = await Chatbot.findByIdAndUpdate
            (req.params.id, req.body, {new: true, runValidators: true});
        res.json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Delete a chatbot by ID
router.delete('/:id', async (req, res) => {
    try{
        const data = await Chatbot.findByIdAndDelete(req.params.id);
        if (data === null || data === undefined || data === '') {
            return res.status(404).json({message: 'Chatbot not found'})
        } else {
            res.json({message: 'Chatbot deleted'})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = router;