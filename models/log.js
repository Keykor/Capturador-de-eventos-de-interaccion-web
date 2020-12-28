const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    age: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    logs: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('Log', logSchema)