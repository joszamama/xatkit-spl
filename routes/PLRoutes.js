const express = require('express');
const PL = require('../models/PL');
const jwt = require("jsonwebtoken");
const upload = require('../commons/Uploader');

const router = express.Router()
require('dotenv').config();

const ADMIN_ID = process.env.ADMIN_ID;

// Create a new PL
router.post('/', upload.single('file'), async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        try {
            const definition = "flama/fm/" + req.body.title + ".uvl";
            console.log(definition);
            const pl = new PL({
                owner: decoded.id,
                title: req.body.title,
                description: req.body.description,
                mode: req.body.mode,
                definition: definition,
            })
            await pl.save();
            res.status(201).json(pl);
        } catch (err) {
            res.status(500).send({
                message: "Could not upload the file",
            });
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