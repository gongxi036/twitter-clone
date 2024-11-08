import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { deleteNotification, getNotifications } from '../controllers/notification.controller.js'

const router = express.Router()
router.get('/', protectRoute, getNotifications)
router.delete('/', protectRoute, deleteNotification)

export default router
