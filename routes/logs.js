const express = require('express')
const router = express.Router()
const Log = require('../models/log')

router.get('/', async (req, res) => {
    try {
        const logs = await Log.find()
        res.json(logs)
    } catch {
        res.status(500).json({message: err.message})
    }
})

router.post('/', async (req, res) =>{
    console.log("nuevo req");
    req.body.forEach(async element => {
        const log = new Log({
            type: element.type,
            timestamp: element.timestamp
        });
        try {
            await log.save();
            console.log("yay!");
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
    res.status(201).json(req.body);
}) 

module.exports = router