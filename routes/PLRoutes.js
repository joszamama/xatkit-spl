const express = require('express');
const PL = require('../models/PL');
const jwt = require("jsonwebtoken");
const upload = require('../commons/Uploader');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const router = express.Router()
require('dotenv').config();

const ADMIN_ID = process.env.ADMIN_ID;
const FLAMA_API_URL = process.env.FLAMA_API_URL;

// Create a new PL
router.post('/', upload.single('file'), async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if ((req.body.title !== undefined) && (req.body.description !== undefined) && (req.body.mode !== undefined)) {
            if (req.file !== undefined) {
                try {
                    fs.readFile(req.file.path, async (err, data) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Error reading file' });
                        }
                        const formData = new FormData();
                        formData.append('file', data, { filename: req.file.originalname });
                        const response = await fetch(FLAMA_API_URL + "/check/model", {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const definition = "flama/fm/" + req.file.filename;
                            const pl = new PL({
                                title: req.body.title,
                                owner: decoded.id,
                                description: req.body.description,
                                mode: req.body.mode,
                                definition: definition
                            });
                            const newPL = await pl.save();
                            res.status(201).json(newPL);
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
            if (pl.owner === decoded.id) {
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



module.exports = router;