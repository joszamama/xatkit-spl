const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Intent = require('../models/Intent');
const router = express.Router()
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ID = process.env.ADMIN_ID;

// Get all intents (ADMIN ONLY)
router.get('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Intent.find();
                res.json(data.map(intent => intent.cleanup()))
            } else {
                res.status(404).json({message: "You are not authorized to view this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get my intents
router.get('/mine', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const data = await Intent.find({owner: verify.id});
                if (data) {
                    res.json(data.map(intent => intent.cleanup()))
                } else {
                    res.json(data)
                }
            } else {
                res.status(404).json({message: "No intent found"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get intents by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Intent.findById(req.params.id);
                res.json(data.cleanup())
            } else {
                res.status(404).json({message: "You are not authorized to view this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get intents from a user by ID (ADMIN ONLY)
router.get('/owner/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Intent.find({owner: req.params.id});
                if (data) {
                    res.json(data.map(intent => intent.cleanup()))
                } else {
                    res.json(data)
                }
            } else {
                res.status(404).json({message: "You are not authorized to view this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})              

// Create a new intent
router.post('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const training = req.body.training.split(',').map(item => item.trim());
                const intent = new Intent({
                    owner: verify.id,
                    title: req.body.title,
                    description: req.body.description,
                    training: training,
                })
                const newIntent = await intent.save();
                res.status(201).json(newIntent.cleanup());
            } else {
                res.status(404).json({message: "You are not authorized to create this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})                  

// Update my intents by ID
router.patch('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const intent = await Intent.findById(req.params.id);
                if (!intent) {
                    res.status(404).json({message: "Intent not found"});
                } else if (intent.owner != verify.id) {
                    res.status(404).json({message: "You are not authorized to edit this intent"});
                } else {
                    if (req.body.title) {
                        intent.title = req.body.title;
                    }
                    if (req.body.description) {
                        intent.description = req.body.description;
                    }
                    if (req.body.training) {
                        intent.training = req.body.training.split(',').map(item => item.trim());
                    }
                    const updatedIntent = await intent.save();
                    res.json(updatedIntent.cleanup());
                }
            } else {
                res.status(404).json({message: "You are not authorized to edit this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Update any intent by ID (ADMIN ONLY)
router.patch('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const intent = await Intent.findById(req.params.id);
                if (!intent) {
                    res.status(404).json({message: "Intent not found"});
                } else {
                    if (req.body.title) {
                        intent.title = req.body.title;
                    }
                    if (req.body.description) {
                        intent.description = req.body.description;
                    }
                    if (req.body.training) {
                        intent.training = req.body.training.split(',').map(item => item.trim());
                    }
                    const updatedIntent = await intent.save();
                    res.json(updatedIntent.cleanup());
                }
            } else {
                res.status(404).json({message: "You are not authorized to edit this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Delete user /me
router.delete('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const intent = await Intent.findById(req.params.id);
                if (!intent) {
                    res.status(404).json({message: "Intent not found"});
                } else if (intent.owner != verify.id) {
                    res.status(404).json({message: "You are not authorized to delete this intent"});
                } else {
                    await intent.remove();
                    res.json({message: "Intent deleted"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to delete this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Delete user by ID (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const intent = await Intent.findById(req.params.id);
                if (!intent) {
                    res.status(404).json({message: "Intent not found"});
                } else {
                    await intent.remove();
                    res.json({message: "Intent deleted"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to delete this intent"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

module.exports = router;