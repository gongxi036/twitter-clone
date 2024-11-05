import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generatetokenAndSetToken } from '../lib/util/generateToken.js'


// 注册
export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body

    // 邮箱规则校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }
    // 判断用户是否存在
    const existeUser = await User.findOne({ username })
    if (existeUser) {
      return res.status(400).json({ error: 'Username is already token' })
    }
    // 判断邮箱是否存在
    const existeEmail = await User.findOne({ email })
    if (existeEmail) {
      return res.status(400).json({ error: 'Email is already token' })
    }

    // 密码规则校验
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    })

    if (newUser) {
      generatetokenAndSetToken(newUser._id, res)
      await newUser.save()
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      })
    } else {
      res.status(400).json({ error: 'Invalid user data' })
    }
  } catch (error) {
    console.error(`Error in signup: ${error.message})`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// 登录
export const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    // 校验密码
    const isPasswordCorrect = await bcrypt.compare(password, user.password || '')
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid user or password'})
    }

    generatetokenAndSetToken(user._id, res)
    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    })
  } catch (error) {
    console.error(`Error in login: ${error.message})`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// 登出
export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 })
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error(`Error in logout: ${error.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// 获取用户信息
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json(user)
  } catch (error) {
    console.error(`Error in getUser: ${error.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
