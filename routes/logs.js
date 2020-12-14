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
    console.log(req.body)
    const log = new Log({
        type: req.body.type,
        timestamp: req.body.timestamp
    })
    try {
        const newLog = await log.save()
        res.status(201).json(newLog)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router