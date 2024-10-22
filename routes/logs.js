const express = require('express')
const router = express.Router()
const Log = require('../models/log')

router.get('/', async (req, res) => {
    console.log("LOGS GET")
    try {
        const logs = await Log.find()
        res.json(logs)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.post('/', async (req, res) =>{
    console.log("LOGS POST")
    const log = new Log({
        age: req.body.age,
        level: req.body.level,
        logs: req.body.logs
    });
    try {
        await log.save();
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
    res.status(201).json(req.body);
}) 

module.exports = router
