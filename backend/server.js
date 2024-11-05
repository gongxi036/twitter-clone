import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import connectMongoDB from './db/db.js'
import authRouters from './routers/auth.route.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRouters)

app.listen(PORT, () => {
  console.log(`Server is start on port ${PORT}`)
  connectMongoDB()
})
