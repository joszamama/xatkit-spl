const express = require('express');
const jwt = require("jsonwebtoken");
const Intent = require('../models/Intent');
const Chatbot = require('../models/Chatbot');
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

// Get my intents by ID
router.get('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                try {
                    const intent = await Intent.findById(req.params.id);
                    if (intent.owner != verify.id) {
                        res.status(404).json({message: "You are not authorized to view this intent"});
                        return;
                    }
                    res.json(intent.cleanup())
                } catch (error) {
                    res.status(404).json({message: "No intent found"});
                    return;
                }
            } else {
                res.status(404).json({message: "No user found"});
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
                    response: req.body.response
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
                    if (req.body.response) {
                        intent.response = req.body.response;
                    }
                    try{
                        const updatedIntent = await intent.save();
                        const chatbots = await Chatbot.find({intents: req.params.id});
                        if (chatbots) {
                            // for every chatbot that has this intent, update the .compiled to false
                            for (let i = 0; i < chatbots.length; i++) {
                                chatbots[i].compiled = false;
                                await chatbots[i].save();
                            }
                            res.json(updatedIntent.cleanup());
                            return;
                        }
                    } catch (error) {
                        res.status(404).json({message: "Could not remove cross references for this intent"});
                    }
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
                    if (req.body.response) {
                        intent.response = req.body.response;
                    }
                    try{
                        const updatedIntent = await intent.save();
                        const chatbots = await Chatbot.find({intents: req.params.id});
                        if (chatbots) {
                            // for every chatbot that has this intent, update the .compiled to false
                            for (let i = 0; i < chatbots.length; i++) {
                                chatbots[i].compiled = false;
                                await chatbots[i].save();
                            }
                            res.json(updatedIntent.cleanup());
                            return;
                        }
                    } catch (error) {
                        res.status(404).json({message: "Could not remove cross references for this intent"});
                    }
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
                    const deletedIntent = await Intent.findByIdAndDelete(req.params.id);
                    const deletedChatbots = await Chatbot.updateMany({intents: req.params.id}, {$pull: {intents: req.params.id}, $set: { compiled: false }});
                    res.json(deletedIntent.cleanup());
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
                    const deletedIntent = await Intent.findByIdAndDelete(req.params.id);
                    const deletedChatbots = await Chatbot.updateMany({intents: req.params.id}, {$pull: {intents: req.params.id}, $set: { compiled: false }});
                    res.json(deletedIntent.cleanup());
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