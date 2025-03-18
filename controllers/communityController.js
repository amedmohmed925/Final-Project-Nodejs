const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Group = require("../models/Group");
const Notification = require("../models/Notification");


createPost = async (req, res) => {
  try {
    const { content, media, type, groupId, courseId } = req.body;
    const post = new Post({
      userId: req.user.id,
      content,
      media,
      type,
      groupId,
      courseId,
    });
    await post.save();

    // إشعار لأعضاء المجموعة لو البوست في مجموعة
    if (groupId) {
      const group = await Group.findById(groupId);
      group.members.forEach(async (memberId) => {
        if (memberId.toString() !== req.user.id.toString()) {
          await new Notification({
            userId: memberId,
            type: "new_post",
            relatedId: post._id,
            message: `${req.user.username} posted in ${group.name}`,
          }).save();
        }
      });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب البوستات
getPosts = async (req, res) => {
  try {
    const { groupId, courseId } = req.query;
    const filter = {};
    if (groupId) filter.groupId = groupId;
    if (courseId) filter.courseId = courseId;
    
    const posts = await Post.find(filter)
      .populate("userId", "username firstName lastName profileImage")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// لايك على بوست
likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      await post.save();

      await new Notification({
        userId: post.userId,
        type: "like",
        relatedId: post._id,
        message: `${req.user.username} liked your post`,
      }).save();
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إنشاء تعليق
createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = new Comment({
      userId: req.user._id,
      postId,
      content,
    });
    await comment.save();

    const post = await Post.findById(postId);
    await new Notification({
      userId: post.userId,
      type: "comment",
      relatedId: comment._id,
      message: `${req.user.username} commented on your post`,
    }).save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب التعليقات
getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "username firstName lastName profileImage")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إنشاء مجموعة
createGroup = async (req, res) => {
  try {
    const { name, description, courseId, isPrivate } = req.body;
    const group = new Group({
      name,
      description,
      creatorId: req.user.id,
      members: [req.user._id],
      courseId,
      isPrivate,
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب المجموعات
getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("creatorId", "username firstName lastName")
      .populate("courseId", "title");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب الإشعارات
getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
    createPost,
    getPosts,
    likePost,
    createComment,
    createGroup,
    getComments,
    getGroups,
    getNotifications
};