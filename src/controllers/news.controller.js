const newsPostModel = require('../models/news.post.model');
const newsCommentModel = require('../models/news.comment.model');
const newsPostLikeModel = require('../models/news.postlike.model');
const newsCommentLikeModel = require('../models/news.commentlike.model');
const uploadToSupabase = require('../utils/uploadToSupabase');
const prisma = require('../config/prisma');
const { findEventAttandeeForComment } = require('../models/eventAttendee.model');

const isIdValid = (id) => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
};

// Create a news post (with up to 10 images)
const createNewsPost = async (req, res) => {
  try {
    const { description, attendeeId } = req.body;
    if (!attendeeId) {
      return res.status(400).json({ message: 'attendeeId is required in the request body.' });
    }
    let images = [];

    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: 'One image is required.' });
    }


    if (req.files.images.length > 10) {
      return res.status(400).json({ message: 'You can upload up to 10 images only.' });
    }
    // Upload each image to Supabase and collect URLs, with error handling
    try {
      images = await Promise.all(
        req.files.images.map(async (file) => {
          try {
            return await uploadToSupabase(file, 'news-posts');
          } catch (uploadErr) {
            throw new Error(`Failed to upload image: ${file.originalname || file.filename}`);
          }
        })
      );
    } catch (uploadError) {
      return res.status(500).json({ message: uploadError.message || 'Image upload failed.' });
    }
    const post = await newsPostModel.createNewsPost({
      description,
      images,
      attendeeId: parseInt(attendeeId)
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a news post
const deleteNewsPost = async (req, res) => {
  try {
    const { id } = req.params;
    await newsPostModel.deleteNewsPost(id);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like or unlike a news post
const likeOrUnlikeNewsPost = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const {attendeeId} = req.body;

    if(!id || !attendeeId){
      return res.status(400).json({message: "Required fields not provided"})
    }
    if (!isIdValid(id) || !isIdValid(attendeeId)) {
      return res.status(400).json({ message: "Ids not valid" });
    }
  
    const newsPost = await newsPostModel.checkPostExitst(Number(id));
    if(!newsPost){
      return res.status(400).json({message : "News post not found."})
    }
    
    const attendee = await findEventAttandeeForComment(Number(attendeeId));
    if(!attendee){
      console.log("5")
      return res.status(400).json({message : "User not found"})
    }

    try {
      await newsPostModel.likeNewsPost(id, attendeeId);
      return res.json({ liked: true });
    } catch (e) {
      // If unique constraint error, then unlike
      await newsPostModel.unlikeNewsPost(id, attendeeId);
      return res.json({ liked: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Increment share count
const incrementShareCount = async (req, res) => {
  const { id } = req.params;

  if(!id){
    return res.status(400).json({message: "Required fields not provided"})
  }
  if (!isIdValid(id) ) {
    return res.status(400).json({ message: "Id not valid" });
  }

  const post = await newsPostModel.checkPostExitst(Number(id));
  if(!post){
    return res.status(400).json({message : "News post not found."})
  }
  try {
    const post = await newsPostModel.incrementShareCount(id);
    res.json({ shares: post.shares });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comment on a post (top-level)
const createNewsComment = async (req, res) => {
  try {
    const { postId, content, attendeeId} = req.body;
    
    if(!postId || !content || !attendeeId){
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newsPost = await newsPostModel.checkPostExitst(postId);
    if(!newsPost){
      return res.status(400).json({message : "News post not found."})
    }


    const attendee = await findEventAttandeeForComment(attendeeId);

    if(!attendee){
      return res.status(400).json({message : "User not found"})
    }
    const comment = await newsCommentModel.createNewsComment({
      postId: parseInt(postId),
      attendeeId: parseInt(attendeeId),
      content,
      parentId: null
    });
    res.status(201).json({...comment, attendee});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply to a comment (only to top-level)
const replyToNewsComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, attendeeId } = req.body;
    // Check if parent is top-level
    const parentComment = await newsCommentModel.findNewsCommentById(commentId);
    if (!parentComment || parentComment.parentId) {
      return res.status(400).json({ message: 'Can only reply to top-level comments.' });
    }
    const reply = await newsCommentModel.createNewsComment({
      postId: parentComment.postId,
      attendeeId: parseInt(attendeeId),
      content,
      parentId: parseInt(commentId)
    });
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like or unlike a comment
const likeOrUnlikeNewsComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const {attendeeId} = req.body;

    if(!commentId || !attendeeId ){
      return res.status(400).json({ message: "Missing required fields" });
    }

    const comment = await newsCommentModel.checkCommentExists(Number(commentId));
    if(!comment){
      return res.status(400).json({message : "Comment not found."})
    }


    const attendee = await findEventAttandeeForComment(attendeeId);

    if(!attendee){
      return res.status(400).json({message : "User not found"})
    }
    try {
      await newsCommentModel.likeNewsComment(commentId, attendeeId);
      return res.json({ liked: true });
    } catch (e) {
      await newsCommentModel.unlikeNewsComment(commentId, attendeeId);
      return res.json({ liked: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all news posts for an event with pagination, latest first
const getNewsPostsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendeeId = parseInt(req.query.attendeeId); // or from req.user
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch posts (no likes included)
    const posts = await newsPostModel.getNewsPostsByEvent(eventId, skip, take);

    // Get all post IDs and comment IDs
    const postIds = posts.map(p => p.id);
    const commentIds = posts.flatMap(p => (p.comments || []).map(c => c.id));

    // Fetch like counts for posts and comments using the like models
    const [postLikeCounts, commentLikeCounts, postLikes, commentLikes] = await Promise.all([
      newsPostLikeModel.groupLikeCountsByPostIds(postIds),
      newsCommentLikeModel.groupLikeCountsByCommentIds(commentIds),
      newsPostLikeModel.findLikesByPostIdsAndAttendee(postIds, attendeeId),
      newsCommentLikeModel.findLikesByCommentIdsAndAttendee(commentIds, attendeeId)
    ]);

    const postLikeCountMap = Object.fromEntries(postLikeCounts.map(lc => [lc.postId, lc._count.postId]));
    const commentLikeCountMap = Object.fromEntries(commentLikeCounts.map(lc => [lc.commentId, lc._count.commentId]));
    const likedPostIds = new Set(postLikes.map(l => l.postId));
    const likedCommentIds = new Set(commentLikes.map(l => l.commentId));

    // Add likeCount and likedByCurrentUser to each post and comment
    const postsWithLikeInfo = posts.map(post => ({
      ...post,
      likeCount: postLikeCountMap[post.id] || 0,
      likedByCurrentUser: likedPostIds.has(post.id),
      comments: (post.comments || []).map(comment => ({
        ...comment,
        likeCount: commentLikeCountMap[comment.id] || 0,
        likedByCurrentUser: likedCommentIds.has(comment.id)
      }))
    }));

    res.json({
      posts: postsWithLikeInfo,
      page,
      pageSize,
      total: postsWithLikeInfo.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNewsPost,
  deleteNewsPost,
  likeOrUnlikeNewsPost,
  incrementShareCount,
  createNewsComment,
  replyToNewsComment,
  likeOrUnlikeNewsComment,
  getNewsPostsByEvent
}; 