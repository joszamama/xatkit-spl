const express = require('express');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const Chatbot = require('../models/Chatbot');
const Intent = require('../models/Intent');
const PL = require('../models/PL');
const router = express.Router()
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ID = process.env.ADMIN_ID;
const FLAMA_API_URL = process.env.FLAMA_API_URL;

// Get all chatbots (ADMIN ONLY)
router.get('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Chatbot.find();
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})

// Get my chatbots
router.get('/mine', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const data = await Chatbot.find({ owner: verify.id });
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})

// Get chatbots from a user by ID (ADMIN ONLY)
router.get('/owner/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await Chatbot.find({ owner: req.params.id });
                res.json(data.map(chatbot => chatbot.cleanup()))
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                        res.status(404).json({ message: "You are not authorized to view this chatbot" });
                    }
                }
                catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                }
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})

// Get chatbots by status
router.get('/status/mine', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const data = await Chatbot.find({ owner: verify.id });
                try {
                    const compiled = data.filter(chatbot => chatbot.compiled);
                    const notCompiled = data.filter(chatbot => !chatbot.compiled);
                    res.json({ compiled: compiled.map(chatbot => chatbot.cleanup()), notCompiled: notCompiled.map(chatbot => chatbot.cleanup()) })
                } catch (error) {
                    res.json({ compiled: [], notCompiled: [] })
                }
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                    res.json({ compiled: compiled.map(chatbot => chatbot.cleanup()), notCompiled: notCompiled.map(chatbot => chatbot.cleanup()) })
                } catch (error) {
                    res.json({ compiled: [], notCompiled: [] })
                }
            } else {
                res.status(404).json({ message: "You are not authorized to view this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})

// Create a new intent
router.post('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                const pl = await PL.findOne({ pl: req.body.pl });
                const intentFeatures = pl.core;
                const everyIntent = pl.intents;
                // remove req.body.intents from everyIntent to get the remaining intents
                for (let i = 0; i < req.body.intents.length; i++) {
                    try {
                        const intent = await Intent.findById(req.body.intents[i]);
                        if (intent.owner != verify.id) {
                            res.status(404).json({ message: "You can only create chatbots with intents that you own" });
                            return;
                        }
                        if (intent.frompl) {
                            intentFeatures.push(intent.title);
                        }
                    } catch {
                        res.status(404).json({ message: "Intent not found" });
                        return;
                    }
                }

                // create a new file named "output.csv"
                const file = fs.createWriteStream("./flama/fm/" + req.body.name + ".csv");

                // write each string from intentFeatures to a separate line in the file
                const uniqueIntentFeatures = [...new Set(intentFeatures)];
                uniqueIntentFeatures.forEach((str) => {
                    file.write(`${str},True\n`);
                });

                file.end(async () => {
                    try {
                        const formData = new FormData();
                        try {
                            const modelData = fs.readFileSync(pl.location);
                            const blob = new Blob([modelData], { type: 'application/octet-stream' });
                            formData.append('model', blob, 'model.uvl');

                            const configPath = `./flama/fm/${req.body.name}.csv`;
                            const configData = fs.readFileSync(configPath);
                            const blob2 = new Blob([configData], { type: 'text/csv' });
                            formData.append('configuration', blob2, 'configuration.csv');


                            const response = await fetch(FLAMA_API_URL + "/validate/configuration", {
                                method: 'POST',
                                body: formData,
                            });

                            if (response.ok) {
                                const chatbot = new Chatbot({
                                    name: req.body.name,
                                    owner: verify.id,
                                    description: req.body.description,
                                    intents: req.body.intents,
                                    pl: req.body.pl,
                                    fallback: req.body.fallback,
                                    compiled: false,
                                });
                                try {
                                    const newChatbot = await chatbot.save();
                                    res.status(201).json(newChatbot.cleanup());
                                } catch (err) {
                                    res.status(400).json({ message: err.message });
                                }
                            } else {
                                res.status(404).json({ message: "Error validating model" });
                            }
                        } catch (err) {
                            console.error(err)
                            return res.status(500).json({ message: 'Error reading file' });
                        }
                    } catch {
                        res.status(404).json({ message: "Error creating chatbot" });
                    }
                });


            } else {
                res.status(404).json({ message: "You are not authorized to create this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                    res.status(404).json({ message: "You can only update chatbots that you own" });
                    return;
                }
                if (req.body.intents) {
                    for (let i = 0; i < req.body.intents.length; i++) {
                        try {
                            const intent = await Intent.findById(req.body.intents[i]);
                            if (intent.owner != verify.id) {
                                res.status(404).json({ message: "You can only update chatbots with intents that you own" });
                                return;
                            }
                        } catch {
                            res.status(404).json({ message: "Intent not found" });
                            return;
                        }
                    }
                }
                if (req.body.name) chatbot.name = req.body.name;
                if (req.body.description) chatbot.description = req.body.description;
                if (req.body.intents) chatbot.intents = req.body.intents;
                if (req.body.fallback) chatbot.fallback = req.body.fallback;
                if (req.body.pl) chatbot.pl = req.body.pl;
                chatbot.compiled = false;
                try {
                    const data = await chatbot.save();
                    res.json(data.cleanup());
                } catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                }
            } else {
                res.status(404).json({ message: "You are not authorized to update this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                if (req.body.pl) chatbot.pl = req.body.pl;
                chatbot.compiled = false;
                try {
                    const data = await chatbot.save();
                    res.json(data.cleanup());
                } catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                }
            } else {
                res.status(404).json({ message: "You are not authorized to update this chatbot" });
                return;
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                        res.status(404).json({ message: "You can only delete chatbots that you own" });
                        return;
                    }
                    await Chatbot.deleteOne({ _id: req.params.id });
                    if (fs.existsSync(`./bots/${data._id.toString()}.json`)) {
                        fs.unlink(`./bots/${data._id.toString()}.json`);
                    }
                    res.json({ message: "Chatbot deleted" });
                } catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                }
            } else {
                res.status(404).json({ message: "You are not authorized to delete this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})


// Delete chatbot by ID (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                try {
                    await Chatbot.deleteOne({ _id: req.params.id });
                    if (fs.existsSync(`./bots/${data._id.toString()}.json`)) {
                        fs.unlink(`./bots/${data._id.toString()}.json`);
                    }
                    res.json({ message: "Chatbot deleted" });
                } catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                    return;
                }
            } else {
                res.status(404).json({ message: "You are not authorized to delete this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
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
                        res.status(404).json({ message: "You can only compile chatbots that you own" });
                        return;
                    }
                    try {
                        const chatbotInfo = chatbot.toChatbot();
                        const intents = await Intent.find({ _id: { $in: chatbot.intents } });
                        const intentInfo = intents.map(intent => intent.toChatbot());
                        chatbotInfo.intents = intentInfo;
                        if (!fs.existsSync(`./bots/${chatbot.id}`)) {
                            fs.mkdirSync(`./bots/${chatbot.id}`);
                        }
                        fs.copyFileSync('./bots/Dockerfile', `./bots/${chatbot.id}/Dockerfile`);
                        fs.readFile(`./bots/${chatbot.id}/Dockerfile`, 'utf-8', (err, data) => {
                            if (err) throw err;

                            // replace the contents
                            let newData = data.replace(/CHANGE_NAME/g, chatbot.name);

                            let newNewData = newData.replace(/CHANGE_DEF/g, JSON.stringify(chatbotInfo));

                            // write the file
                            fs.writeFile(`./bots/${chatbot.id}/Dockerfile`, newNewData, 'utf-8', (err) => {
                                if (err) throw err;
                            });
                        });
                        chatbot.compiled = true;
                        const data = await chatbot.save();
                        res.download(`./bots/${chatbot.id}/Dockerfile`);
                    } catch (error) {
                        res.status(404).json({ message: "Could not compile chatbot" });
                        return;
                    }
                } catch (error) {
                    res.status(404).json({ message: "Chatbot not found" });
                }
            } else {
                res.status(404).json({ message: "You are not authorized to compile this chatbot" });
            }
        } catch (error) {
            res.status(404).json({ message: "Token not valid" });
        }
    } else {
        res.status(404).json({ message: "Token not found" });
    }
})





module.exports = router;