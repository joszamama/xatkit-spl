const express = require('express');
const PL = require('../models/PL');
const jwt = require("jsonwebtoken");
const Uploader = require('../commons/Uploader');
const fs = require('fs');
const Intent = require('../models/Intent');
const FormData = require('form-data');
const fetch = require('node-fetch');

const router = express.Router()
require('dotenv').config();

const ADMIN_ID = process.env.ADMIN_ID;
const FLAMA_API_URL = process.env.FLAMA_API_URL;

// Create a new PL
router.post('/', Uploader, async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if ((req.body.title !== undefined) && (req.body.description !== undefined) && (req.body.mode !== undefined)) {
            if ((req.files['model'] !== undefined) && (req.files['intents'] !== undefined)) {
                const model = req.files['model'][0];
                const intents = req.files['intents'][0];
                try {
                    fs.readFile(model.path, async (err, data) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Error reading file' });
                        }
                        const formData = new FormData();
                        formData.append('model', data, { filename: model.originalname });
                        const response = await fetch(FLAMA_API_URL + "/validate/model", {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            if (req.body.mode === "LeafOnly") {
                                POST_URL = "/find/leaf-features";
                            } else if (req.body.mode === "ConcreteOnly") {
                                POST_URL = "/find/concrete-features";
                            }
                            try {
                                const formData = new FormData();
                                formData.append('model', data, { filename: model.originalname });
                                const response = await fetch(FLAMA_API_URL + POST_URL, {
                                    method: 'POST',
                                    body: formData,
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });
                                if (response.ok) {
                                    const result = await response.json();
                                    // read file from intents.path
                                    const fileContent = fs.readFileSync(intents.path, 'utf-8');
                                    // Split the file content into lines
                                    const lines = fileContent.trim().split('\n');
                                    // Create an array of intents
                                    const intentsArray = [];
                                    for (let i = 0; i < lines.length; i++) {
                                        const intent = lines[i].trim().split(':');
                                        const intentName = intent[0].trim();
                                        const rest = intent[1].trim().split(',');;
                                        const intentDescription = rest[0].trim();
                                        const intentTraining = rest[1].trim().replace("[", "").replace("]", "").split(";").map(item => item.trim());
                                        const intentResponse = rest[2].trim().replace("[", "").replace("]", "");

                                        const newIntent = {
                                            owner: decoded.id,
                                            title: intentName,
                                            description: intentDescription,
                                            training: intentTraining,
                                            response: intentResponse,
                                            frompl: true
                                        }
                                        intentsArray.push(newIntent);
                                    }

                                    // check we have info for all intents
                                    if (intentsArray.length !== result.length) {
                                        res.status(400).json({ message: "Intent file does not contain all needed info" });
                                    }

                                    // check all intents are in result
                                    for (let i = 0; i < intentsArray.length; i++) {
                                        const intent = intentsArray[i];
                                        const found = result.find(element => element === intent.title);
                                        if (found === undefined) {
                                            res.status(400).json({ message: "Intent file contains info for an intent not present in the model" });
                                        }
                                    }

                                    // save intents
                                    const intentIds = [];
                                    for (let i = 0; i < intentsArray.length; i++) {
                                        const intent = intentsArray[i];
                                        const newIntent = new Intent(intent);
                                        await newIntent.save();
                                        intentIds.push(newIntent._id);
                                    }

                                    const coreFeatures = [];

                                    try {
                                        const formData = new FormData();
                                        formData.append('model', data, { filename: model.originalname });
                                        const response = await fetch(FLAMA_API_URL + "/find/core-features", {
                                            method: 'POST',
                                            body: formData,
                                            headers: {
                                                'Authorization': `Bearer ${token}`
                                            }
                                        });
                                        if (response.ok) {
                                            const result = await response.json();
                                            for (let i = 0; i < result.length; i++) {
                                                coreFeatures.push(result[i]);
                                            }
                                        }
                                    } catch (err) {
                                        res.status(400).json({ message: err.message });
                                    }



                                    const pl = new PL({
                                        owner: decoded.id,
                                        title: req.body.title,
                                        description: req.body.description,
                                        mode: req.body.mode,
                                        location: model.path,
                                        core: coreFeatures,
                                        intents: intentIds,
                                    });
                                    pl.save();

                                    res.status(201).json({ message: "PL created" });
                                }
                            } catch (err) {
                                res.status(400).json({ message: err.message });
                            }
                        } else {
                            // if not success, delete file from server and return error
                            await fs.promises.unlink(req.file.path);
                            res.status(400).json({ message: "UVL does not represent a valid PL" });
                        }
                    });
                } catch (err) {
                    res.status(400).json({ message: err.message });
                }
            } else {
                res.status(400).json({ message: "Wrong file definition" });
            }
        } else {
            res.status(400).json({ message: "Wrong PL definition" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Get all PLs (ADMIN ONLY)
router.get('/', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === ADMIN_ID) {
            try {
                const pls = await PL.find();
                res.json(pls);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Get my PLs
router.get('/mine', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        try {
            const pls = await PL.find({ owner: decoded.id });
            res.json(pls);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Get my PL by ID
router.get('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        try {
            const pl = await PL.findById(req.params.id);
            if (pl.owner.toString() === decoded.id) {
                res.json(pl);
            } else {
                res.status(401).json({ message: "Unauthorized" });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Get any PL by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === ADMIN_ID) {
            try {
                const pl = await PL.findById(req.params.id);
                res.json(pl);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Get all PLs by owner (ADMIN ONLY)
router.get('/owner/:id', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === ADMIN_ID) {
            try {
                const pls = await PL.find({ owner: req.params.id });
                res.json(pls);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Delete my PL by ID
router.delete('/mine/:id', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        try {
            const pl = await PL.findById(req.params.id);
            if (pl.owner.toString() === decoded.id) {
                fs.unlinkSync(pl.location);
                await pl.remove();
                res.json({ message: "PL deleted" });
            } else {
                res.status(401).json({ message: "Unauthorized" });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})

// Delete any PL by ID (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === ADMIN_ID) {
            try {
                const pl = await PL.findById(req.params.id);
                fs.unlinkSync(pl.location);
                await pl.remove();
                res.json({ message: "PL deleted" });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "No token provided" });
    }
})


module.exports = router;