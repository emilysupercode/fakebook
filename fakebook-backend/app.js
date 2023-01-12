import express from 'express'
import cors from 'cors'
import './config/config.js'
import { getDb } from './utils/db.js'
import morgan from 'morgan'
import { ObjectID } from 'bson'
import multer from 'multer'
import { body, validationResult } from 'express-validator'


const PORT = process.env.PORT
const app = express()

const formReader = multer()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const fakebookPath = '/api/fakebook'
const profilePath = '/api/fakebook/profile/:id'
const addPath = '/api/fakebook/add'

app.get(fakebookPath, (req, res) => {
    getDb()
        .then(db => db.collection('contacts').find())
        .then(pointer => pointer.toArray())
        .then(array => res.status(200).json(array))
})

app.get(profilePath, (req, res) => {
    const params = req.params.id
    const searchId = ObjectID(params)

    getDb()
        .then(db => db.collection('contacts').find({ "_id": searchId }))
        .then(cursor => cursor.toArray())
        .then(data => res.status(200).json(data))
})

app.post(addPath, formReader.none(),
    body('email').isEmail(),
    body('name').isLength({ min: 1, max: 50 }),
    body('last').isLength({ min: 1, max: 50 }),
    (req, res) => {
        const contact = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            getDb()
                .then(db => {
                    console.log('logging new contact', contact)
                    return db.collection('contacts').insertOne(contact)
                })
                .then(acknowledge => res.status(200).json(acknowledge))
        }
    }
)

app.delete(profilePath, (req, res) => {
    const params = req.params.id
    const searchId = ObjectID(params)

    getDb()
        .then(db => db.collection('contacts').deleteOne({ "_id": searchId }))
        .then(data => res.status(200).json(data))

})

app.listen(PORT, () => console.log('running on', PORT))