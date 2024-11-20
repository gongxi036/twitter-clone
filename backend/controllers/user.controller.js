import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"
import User from '../models/user.model.js'
import Notification from '../models/notification.model.js'

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOne({ username }).select('-password')

    if (!user) {
      return res.status(400).json({ error: 'User not found, getUserProfile'})
    }
    res.status(200).json(user)
  } catch (error) {
    console.error(`Error in getUserProfile: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
}
// 点击关注
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    // 判断是否是用一个人
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cna't follow/unfollow yourself"})
    }
    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: 'User not found'})
    }

    // 判断是否已经关注
    const isFollowing = currentUser.following.includes(id)
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id }})
      res.status(200).json({ message: 'user unfollowed successfully' })
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id }})
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id }})
      // notification
      const newNotification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: 'follow'
      })
      await newNotification.save()
      res.status(200).json({ message: 'user followed successfully' })
    }
  } catch (error) {
    console.error(`Error in followUnfollowUser: ${error.message}`)
    res.status(500).json({ error: error.message})
  }
}

// 获取推荐人
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id
    // 获取我关注的人
    const userFollowedByMe = await User.findById(userId).select('following')
    
    // 获取 user 列表
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      { $sample: { size: 10 }}
    ])

    // 获取我关注的人中，不在 userFollowedByMe 列表中的人
    const filteredUsers = users.filter(user => !userFollowedByMe.following.includes(user._id))
    const suggestedUsers = filteredUsers.slice(0,4)

    // 密码置空
    suggestedUsers.forEach(user => user.password = null)
    res.status(200).json(suggestedUsers)
  } catch (error) {
    console.error(`Error in getSuggestedUsers: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
}

// 更新用户信息
export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body
  let { profileImg, coverImg } = req.body
  const userId = req.user._id
  try {
    let user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
      return res.status(400).json({ error: 'Please provide both current password and new password' })
    }
    if (currentPassword && newPassword) {
      const isMatch = bcrypt.compare(currentPassword, user.password)
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' })
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long'})
      }
      // 新密码加密
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }
    // 个人头像
    if (profileImg) {
      if (user.profileImg) {
        // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg)
      profileImg = uploadedResponse.secure_url
    }

    if (coverImg) {
      if (user.coverImg) {
        // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg)
      coverImg = uploadedResponse.secure_url
    }

    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.username = username || user.username
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg

    user = await user.save()
    user.password = null
    res.status(200).json(user)
  } catch (error) {
    console.error(`Error in updateUser: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
}
