const express = require('express');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const Chatbot = require('../models/Chatbot');
const Intent = require('../models/Intent');
const { Console } = require('console');
const router = express.Router()
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ID = process.env.ADMIN_ID;

// Get all chatbots (ADMIN ONLY)
router.get('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Chatbot.find();
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get my chatbots
router.get('/mine', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const data = await Chatbot.find({owner: verify.id});
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get a chatbot by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Chatbot.findById(req.params.id);
                if (data) {
                    res.json(data.cleanup())
                } else {
                    res.json(data)
                }
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get chatbots from a user by ID (ADMIN ONLY)
router.get('/owner/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Chatbot.find({owner: req.params.id});
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})              

// Get my chatbot by ID
router.get('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                try {
                    const data = await Chatbot.findById(req.params.id);
                    if (data.owner == verify.id) {
                        res.json(data.cleanup())
                    } else {
                        res.status(404).json({message: "You are not authorized to view this chatbot"});
                    }
                }
                catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get chatbots by status
router.get('/status/mine', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const data = await Chatbot.find({owner: verify.id});
                try {
                    const compiled = data.filter(chatbot => chatbot.compiled);
                    const notCompiled = data.filter(chatbot => !chatbot.compiled);
                    res.json({compiled: compiled.map(chatbot => chatbot.cleanup()), notCompiled: notCompiled.map(chatbot => chatbot.cleanup())})
                } catch (error) {
                    res.json({compiled: [], notCompiled: []})
                }
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get chatbots by status (ADMIN ONLY)
router.get('/all/status', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                try {
                    const data = await Chatbot.find();
                    const compiled = data.filter(chatbot => chatbot.compiled);
                    const notCompiled = data.filter(chatbot => !chatbot.compiled);
                    res.json({compiled: compiled.map(chatbot => chatbot.cleanup()), notCompiled: notCompiled.map(chatbot => chatbot.cleanup())})
                } catch (error) {
                    res.json({compiled: [], notCompiled: []})
                }
            } else {
                res.status(404).json({message: "You are not authorized to view this chatbot"});
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
                for (let i = 0; i < req.body.intents.length; i++) {
                    try{
                        const intent = await Intent.findById(req.body.intents[i]);
                        if (intent.owner != verify.id) {
                            res.status(404).json({message: "You can only create chatbots with intents that you own"});
                            return;
                        }
                    } catch {
                        res.status(404).json({message: "Intent not found"});
                        return;
                    }
                }
                const chatbot = new Chatbot({
                    name: req.body.name,
                    description: req.body.description,
                    intents: req.body.intents,
                    owner: verify.id,
                    fallback: req.body.fallback
                });
                const data = await chatbot.save();
                res.json(data.cleanup());
            } else {
                res.status(404).json({message: "You are not authorized to create this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})                  

// Update my chatbot by ID
router.patch('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const chatbot = await Chatbot.findById(req.params.id);
                if (chatbot.owner != verify.id) {
                    res.status(404).json({message: "You can only update chatbots that you own"});
                    return;
                }
                if (req.body.intents) {
                    for (let i = 0; i < req.body.intents.length; i++) {
                        try{
                            const intent = await Intent.findById(req.body.intents[i]);
                            if (intent.owner != verify.id) {
                                res.status(404).json({message: "You can only update chatbots with intents that you own"});
                                return;
                            }
                        } catch {
                            res.status(404).json({message: "Intent not found"});
                            return;
                        }
                    }
                }
                if (req.body.name) chatbot.name = req.body.name;
                if (req.body.description) chatbot.description = req.body.description;
                if (req.body.intents) chatbot.intents = req.body.intents;
                if (req.body.fallback) chatbot.fallback = req.body.fallback;
                chatbot.compiled = false;
                try {
                    const data = await chatbot.save();
                    res.json(data.cleanup());
                } catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to update this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Update any chatbot by ID (ADMIN ONLY)
router.patch('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const chatbot = await Chatbot.findById(req.params.id);
                if (req.body.name) chatbot.name = req.body.name;
                if (req.body.description) chatbot.description = req.body.description;
                if (req.body.intents) chatbot.intents = req.body.intents;
                if (req.body.fallback) chatbot.fallback = req.body.fallback;
                chatbot.compiled = false;
                try {
                    const data = await chatbot.save();
                    res.json(data.cleanup());
                } catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to update this chatbot"});
                return;
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Delete chatbot /me
router.delete('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                try {
                    const data = await Chatbot.findById(req.params.id);
                    if (data.owner != verify.id) {
                        res.status(404).json({message: "You can only delete chatbots that you own"});
                        return;
                    }
                    await Chatbot.deleteOne({_id: req.params.id});
                    if (fs.existsSync(`./bots/${data._id.toString()}.json`)) {
                        fs.unlink(`./bots/${data._id.toString()}.json`);
                    }
                    res.json({message: "Chatbot deleted"});
                } catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to delete this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})


// Delete chatbot by ID (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                try {
                    await Chatbot.deleteOne({_id: req.params.id});
                    if (fs.existsSync(`./bots/${data._id.toString()}.json`)) {
                        fs.unlink(`./bots/${data._id.toString()}.json`);
                    }
                    res.json({message: "Chatbot deleted"});
                } catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                    return;
                }
            } else {
                res.status(404).json({message: "You are not authorized to delete this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Compile my chatbot by id
router.post('/mine/:id/compile', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                try {
                    const chatbot = await Chatbot.findById(req.params.id);
                    if (chatbot.owner != verify.id) {
                        res.status(404).json({message: "You can only compile chatbots that you own"});
                        return;
                    }
                    try {
                        const chatbotInfo = chatbot.toChatbot();
                        const intents = await Intent.find({_id: {$in: chatbot.intents}});
                        const intentInfo = intents.map(intent => intent.toChatbot());
                        chatbotInfo.intents = intentInfo;
                        if (!fs.existsSync(`./bots/${chatbot.id}`)) {
                            fs.mkdirSync(`./bots/${chatbot.id}`);
                        }
                        fs.copyFileSync('./bots/Dockerfile', `./bots/${chatbot.id}/Dockerfile`);
                        fs.writeFileSync(`./bots/${chatbot.id}/${chatbot.id}.txt`, JSON.stringify(chatbotInfo));
                        chatbot.compiled = true;
                        const data = await chatbot.save();
                        res.json({message: "Chatbot compiled successfully"});
                    } catch (error) {
                        res.status(404).json({message: "Could not compile chatbot"});
                        return;
                    }
                } catch (error) {
                    res.status(404).json({message: "Chatbot not found"});
                }
            } else {
                res.status(404).json({message: "You are not authorized to compile this chatbot"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})





module.exports = router;