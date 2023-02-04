const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const jwt_decode = require('jwt-decode');
const router = express.Router()
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ID = process.env.ADMIN_ID;

// Get all users (ADMIN ONLY)
router.get('/', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            console.log(verify.id);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await User.find();
                res.json(data.map(user => user.cleanup()))
            } else {
                res.status(404).json({message: "You are not authorized to view this page"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Get current user
router.get('/me', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            console.log(verify);
            if (verify.id) {
                const data = await User.findById(verify.id);
                res.json(data.cleanup())
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

// Get user by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id && verify.id === ADMIN_ID) {
                const data = await User.findById(req.params.id);
                res.json(data.cleanup())
            } else {
                res.status(404).json({message: "You are not authorized to view this page"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Create a new user
router.post('/', async (req, res) => {
    const data = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave.cleanup())
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})                  

// Update user by ID
router.patch('/me', async (req, res) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
            if (verify.id) {
                try {
                    const user = await User.findById(verify.id);
                    if (req.body.username) {
                        user.username = req.body.username;
                    }
                    if (req.body.email) {
                        user.email = req.body.email;
                    }
                    if (req.body.password) {
                        user.password = req.body.password;
                    }
                    const updatedUser = await user.save();
                    res.status(200).json(updatedUser);
                } catch (error) {
                    res.status(404).json({message: "User not found"});
                }        
            } else {
                res.status(404).json({message: "You are not authorized to edit this user"});
            }
        } catch (error) {
            res.status(404).json({message: "Token not valid"});
        }
    } else {
        res.status(404).json({message: "Token not found"});
    }
})

// Log in user and return user data
router.post('/login', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: 'Username and password are required' });
    } else {
        try {
            const user = await User.findOne ({ username: req.body.username });
            if (user) {
                const validPassword = await bcrypt.compare(req.body.password, user.password);
                if (validPassword) {
                    const payload = user.cleanup();
                    const accessToken = generateAccessToken(payload, JWT_SECRET);
                    res.status(200).send({
                      message: "User authenticated",
                      accessToken,
                    });
                } else {
                    res.status(400).json({ message: 'Invalid password' });
                }
            } else {
                res.status(400).json({ message: 'User not found' });
            }
        } catch (err) {
            res.status(400).json({ message: 'Cannot login user right now, try again later' });
        }
    }
});

function generateAccessToken(payload, secret) {
    return jwt.sign(payload, secret);
}

module.exports = router;