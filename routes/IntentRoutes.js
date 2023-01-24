const express = require('express');
const Intent = require('../models/Intent');
const router = express.Router()

// Get all intents
router.get('/', async (req, res) => {
    try{
        const data = await Intent.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get an intent by ID
router.get('/:id', async (req, res) => {
    try{
        const data = await Intent.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get all intents by owner
router.get('/owner/:owner', async (req, res) => {
    try{
        const data = await Intent.find({owner: req.params.owner});
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Create an Intent
router.post('/', async (req, res) => {
    training = req.body.training.split(',').map(item => item.trim());
    const intent = new Intent({
        owner: req.body.owner,
        title: req.body.title,
        description: req.body.description,
        training: training
    })
    try{
        const data = await intent.save();
        res.status(201).json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Update an Intent
router.put('/:id', async (req, res) => {
    try{
        const data = await Intent.findByIdAndUpdate
            (req.params.id, req.body
            , {new: true, runValidators: true});
        res.json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Delete an Intent
router.delete('/:id', async (req, res) => {
    try{
        const data = await Intent.findByIdAndDelete(req.params.id);
        if (data === null || data === undefined || data === '') {
            res.status(404).json({message: "Intent not found"})
        } else {
            res.json({message: "Intent deleted"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = router;