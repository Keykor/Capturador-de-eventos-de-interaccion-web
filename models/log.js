const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    data: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('Log', logSchema)