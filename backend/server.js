import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

import connectMongoDB from './db/db.js'
import authRouters from './routers/auth.route.js'
import userRouters from './routers/user.route.js'
import postRouters from './routers/post.route.js'
import notificationRouters from './routers/notification.route.js'

const app = express()
dotenv.config()

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
const PORT = process.env.PORT
const __dirname = path.resolve()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRouters)
app.use('/api/users', userRouters)
app.use('/api/posts', postRouters)
app.use('/api/notifications', notificationRouters)

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server is start on port ${PORT}`)
  connectMongoDB()
})
