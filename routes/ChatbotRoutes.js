const express = require('express');
const mongoose = require('mongoose');
const Chatbot = require('../models/Chatbot');
const router = express.Router()

// Get all chatbots
router.get('/', async (req, res) => {
    if (req.query.ownerId) {
        try {
            const data = await Chatbot.find({owner: req.query.ownerId});
            res.json(data)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        try{
            const data = await Chatbot.find();
            res.json(data)
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
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

// Create a chatbot
router.post('/', async (req, res) => {
    const chatbot = new Chatbot({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        owner: req.body.owner,
        role: req.body.role,
        intents: req.body.intents
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
    if (req.body.intents){
        try {
            const data = await Chatbot.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        owner: req.body.owner,
                        role: req.body.role,
                        intents: req.body.intents,
                        updated: false
                    }
                }
            );
            res.status(201).json({message: 'Chatbot updated'});
        }
        catch(error){
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(400).json({message: 'Intents cannot be null'})
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
        res.status(500).json({message: 'Chatbot not found'})
    }
})

router.post('/:id/compile', async (req, res) => {
    const chatbot = await Chatbot.findById(req.params.id);
    if (chatbot) {
        res.status(200).json({message: 'Chatbot compiled'})
    } else {
        res.status(404).json({message: 'Chatbot not found'})
    }
})


module.exports = router;