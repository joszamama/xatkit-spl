const express = require('express');
const Network = require('../models/Network');
const router = express.Router()

// Get all networks
router.get('/', async (req, res) => {
    try{
        const data = await Network.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get network by ID
router.get('/:id', async (req, res) => {
    try{
        const data = await Network.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Get all networks by owner
router.get('/owner/:owner', async (req, res) => {
    try{
        const data = await Network.find({owner: req.params.owner});
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// Create a network
router.post('/', async (req, res) => {
    const network = new Network({
        owner: req.body.owner,
        name: req.body.name,
        description: req.body.description,
        father: req.body.father,
        sons: req.body.sons
    })
    try{
        const data = await network.save();
        res.status(201).json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Update a network
router.put('/:id', async (req, res) => {
    try{
        const data = await Network.findByIdAndUpdate
            (req.params.id, req.body
                , {new: true, runValidators: true});
        res.json(data)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
})

// Delete a network
router.delete('/:id', async (req, res) => {
    try{
        const data = await Network.findByIdAndDelete(req.params.id);
        if (data === null || data === undefined || data === '') {
            res.status(404).json({message: 'Network not found'})
        } else {
            res.json({message: 'Network deleted successfully'})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


module.exports = router;