import Notification from '../models/notification.model.js'


export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    const notifications = await Notification.find({ to: userId })
      .populate({
        path: 'from',
        select: 'username profileImg',
      })

    await Notification.updateMany({ to: userId }, { read: true })

    res.status(200).json(notifications)
  } catch (error) {
    console.error(`Error in getNotifications: ${error.message}`)
    res.status(500).jsonP({ error: 'Internal server error' })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id
    await Notification.deleteMany({ to: userId })

    res.status(200).json({ message: 'Notifications delted successfully' })
  } catch (error) {
    console.error(`Error in deleteNotification: ${error.message}`)
    res.status(500).json({ error: 'Internal server error'  })
  }
}
