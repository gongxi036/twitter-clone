import cloudinary from 'cloudinary'
import User from '../models/user.model.js'
import Post from "../models/post.model.js"
import Notification from '../models/notification.model.js'

// create post
export const createPost = async (req, res, next) => {
  try {
    const { text } = req.body
    let { img } = req.body

    const userId = req.user._id.toString()

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (!text && !img) return res.status(404).json({ error: 'Post must have text or image' })
    
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img)
      img = uploadedResponse.secure_url
    }

    const newPost = new Post({
      user: userId,
      text,
      img
    })
    await newPost.save()
    res.status(201).json(newPost)
  } catch (error) {
    console.error(`Error in createPost: ${error.message}`)
    res.status(500).json({ error: 'Internal server error'})
  }
}

// delete post
export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params
    const post = await Post.findById(postId)
  
    if (!post) return res.status(404).json({ error: 'Post not found' })
  
    // can auther delete the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'You are authorized to delete this post' })
    }
  
    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(imgId)
    }
    await Post.findByIdAndDelete(postId)
    res.status(200).json({ message: 'Post deleted successfully'})
  } catch (error) {
    console.error(`Error in deletePost: ${error.message}`)
    res.status(500).json({ error: 'Internal server error'})
  }
}

// comment on the post
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body
    const postId = req.params.id
    const userId = req.user._id

    if (!text) return res.status(400).json({ error: 'Text field is required' })
    
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const comment = { user: userId, text }
    post.comments.push(comment)
    await post.save()
    res.status(200).json(post)
  } catch (error) {
    console.error(`Error in commentOnPost: ${error.message}`)
    res.status(500).json({ error: 'Internal server error'})
  }
}

// like or unlike
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id
    const { id: postId } = req.params

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const userLikedPost = post.likes.includes(userId)

    if (userLikedPost) {
      // unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId }})
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId }})

      const updatedLikes = post.likes.filter(id => id.toString() !== userId.toString())
      return res.status(200).json(updatedLikes)
    } else {
      // like
      post.likes.push(userId)
      await User.updateOne({ _id: userId }, { $push: { likePosts: postId }})
      await post.save()

      const newNotification = new Notification({
        from: userId,
        to: post.user,
        type: 'like'
      })

      await newNotification.save()
      res.status(200).json(post.likes)
    }
  } catch (error) {
    console.error(`Error in likeUnlikePost: ${error.message}`)
    res.status(500).json({ error: 'Internal server error'})
  }
}

// get all psots
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })
    
    if (posts.length === 0) {
      return res.status(200).json([])
    }
    res.status(200).json(posts)
  } catch (error) {
    console.error('Error in getAllPosts: ${error.message')
    res.status(500).json({ error: 'Internal server error'})
  }
}

// get the posts where the user likes
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const likedPosts = await Post.find({ _id: { $in: user.likePosts }})
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

    res.status(200).json(likedPosts)
  } catch (error) {
    console.error(`Error in getLikedPosts: ${error.message}`)
    res.status(500).json({ error: 'Interval server error'})
  }
}

// get the posts where the user follows
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const following = user.following
    const feedPost = await Post.find({ user: { $in : following }})
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

      res.status(200).json(feedPost)
  } catch (error) {
    console.error(`Error in getFollowingPosts: ${error.message}`)
    res.status(500).json({ error: 'Interval server error'})
  }
}


// get user own posts
export const getUserPosts = async (req, res) => {
  try {
    const username = req.params.username
    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const posts = await Post.find({ user: user._id})
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      })

    res.status(200).json(posts)
  } catch (error) {
    console.error(`Error in getUserPosts: ${error.message}`)
    res.status(500).json({ error: 'Interval server error' })
  }
}
