import express from 'express'
import { signup, login, logout, getUser } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/getUser', protectRoute, getUser)
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

export default router
