import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

import connectMongoDB from './db/db.js'
import authRouters from './routers/auth.route.js'
import userRouters from './routers/user.route.js'

const app = express()
dotenv.config()

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRouters)
app.use('/api/users', userRouters)

app.listen(PORT, () => {
  console.log(`Server is start on port ${PORT}`)
  connectMongoDB()
})
