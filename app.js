require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

app.use(cors())

app.use(express.static('public'))

const path = require('path')
const indexRouter = express.Router()
indexRouter.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname+'/pages/WorldVision.html'));
})
app.use('/', indexRouter)

const logsRouter = require('./routes/logs')
app.use('/logs', logsRouter)

app.listen(3000, () => console.log('Server Started'))