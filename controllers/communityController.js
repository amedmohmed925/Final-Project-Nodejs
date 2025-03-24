const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Group = require("../models//groupModel");
const ChatRoom = require("../models/chatRoomModel");
const Notification = require("../models/Notification");
const ActivityStats = require("../models/activityStatsModel");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const { content, media, type, groupId, courseId } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = new Post({ userId: req.user.id, content, media, type, groupId, courseId });
    await post.save();

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
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

    await ActivityStats.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { postsCount: 1 }, lastActive: Date.now() },
      { upsert: true }
    );

    res.status(201).json(post);
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { groupId, courseId } = req.query;
    const filter = {};
    if (groupId) filter.groupId = groupId;
    if (courseId) filter.courseId = courseId;

    const posts = await Post.find(filter)
      .populate("userId", "username firstName lastName profileImage")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error in getPosts:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // إذا كان اليوزر عامل لايك بالفعل، نحذف اللايك
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      await post.save();

      // حذف الإشعار المرتبط باللايك لو موجود
      await Notification.deleteOne({
        userId: post.userId,
        type: "like",
        relatedId: post._id,
        message: `${req.user.username} liked your post`,
      });

      await ActivityStats.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { likesGiven: -1 }, lastActive: Date.now() },
        { upsert: true }
      );
    } else {
      // إذا كان اليوزر مش عامل لايك، نضيف اللايك
      post.likes.push(userId);
      await post.save();

      await new Notification({
        userId: post.userId,
        type: "like",
        relatedId: post._id,
        message: `${req.user.username} liked your post`,
      }).save();

      await ActivityStats.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { likesGiven: 1 }, lastActive: Date.now() },
        { upsert: true }
      );
    }

    res.json(post);
  } catch (err) {
    console.error("Error in likePost:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    if (!content || !postId) return res.status(400).json({ message: "Content and postId are required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({ 
      userId: req.user.id, 
      postId, 
      content, 
      parentCommentId, 
      likes: [] 
    });
    await comment.save();

    // ملء بيانات userId قبل الإرجاع
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username firstName lastName profileImage");

    await new Notification({
      userId: post.userId,
      type: "comment",
      relatedId: comment._id,
      message: `${req.user.username} commented on your post`,
    }).save();

    await ActivityStats.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { commentsCount: 1 }, lastActive: Date.now() },
      { upsert: true }
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error in createComment:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "username firstName lastName profileImage")
      .sort({ createdAt: -1 });
    
    console.log("Comments with populated userId:", JSON.stringify(comments, null, 2));
    res.json(comments);
  } catch (err) {
    console.error("Error in getComments:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment || comment.postId.toString() !== postId) return res.status(404).json({ message: "Comment not found" });

    if (!comment.likes.includes(req.user.id)) {
      comment.likes.push(req.user.id);
      await comment.save();

      await new Notification({
        userId: comment.userId,
        type: "comment_like",
        relatedId: comment._id,
        message: `${req.user.username} liked your comment`,
      }).save();

      await ActivityStats.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { likesGiven: 1 }, lastActive: Date.now() },
        { upsert: true }
      );
    }
    res.json((await Comment.find({ postId }).populate("userId", "username firstName lastName profileImage")).sort({ createdAt: -1 }));
  } catch (err) {
    console.error("Error in likeComment:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, courseId, isPrivate, invitedMembers } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const group = new Group({
      name,
      description,
      creatorId: req.user.id,
      members: [req.user.id],
      courseId,
      isPrivate,
      pendingInvites: invitedMembers || [],
    });
    await group.save();

    invitedMembers?.forEach(async (memberId) => {
      await new Notification({
        userId: memberId,
        type: "group_invite",
        relatedId: group._id,
        message: `${req.user.username} invited you to join ${group.name}`,
      }).save();
    });

    await ActivityStats.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { groupsJoined: 1 }, lastActive: Date.now() },
      { upsert: true }
    );

    res.status(201).json(group);
  } catch (err) {
    console.error("Error in createGroup:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.acceptGroupInvite = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.pendingInvites.includes(req.user.id)) {
      group.pendingInvites = group.pendingInvites.filter(id => id.toString() !== req.user.id.toString());
      group.members.push(req.user.id);
      await group.save();

      await ActivityStats.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { groupsJoined: 1 }, lastActive: Date.now() },
        { upsert: true }
      );
    }
    res.json(group);
  } catch (err) {
    console.error("Error in acceptGroupInvite:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ $or: [{ members: req.user.id }, { pendingInvites: req.user.id }] })
      .populate("creatorId", "username firstName lastName")
      .populate("courseId", "title");
    res.json(groups);
  } catch (err) {
    console.error("Error in getGroups:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.addGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.creatorId.toString() !== req.user.id) return res.status(403).json({ message: "Only creator can add members" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      group.pendingInvites = group.pendingInvites.filter(id => id.toString() !== userId);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.creatorId.toString() !== req.user.id) return res.status(403).json({ message: "Only creator can remove members" });

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


exports.createChatRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Chat room name is required" });

    const chatRoom = new ChatRoom({
      name,
      creatorId: req.user.id,
      participants: [req.user.id],
    });
    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (err) {
    console.error("Error in createChatRoom:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ participants: req.user.id })
      .populate("creatorId", "username firstName lastName");
    res.json(chatRooms);
  } catch (err) {
    console.error("Error in getChatRooms:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    if (!groupId || !content) return res.status(400).json({ message: "groupId and content are required" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.chatMessages.push({ userId: req.user.id, content });
    await group.save();

    await ActivityStats.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { chatMessages: 1 }, lastActive: Date.now() },
      { upsert: true }
    );

    res.json(group.chatMessages[group.chatMessages.length - 1]);
  } catch (err) {
    console.error("Error in sendGroupMessage:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.sendAdminNotification = async (req, res) => {
  try {
    const { message, broadcastTo } = req.body;
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });

    const notification = new Notification({
      type: "admin_broadcast",
      message,
      broadcastTo,
    });
    await notification.save();

    res.status(201).json(notification);
  } catch (err) {
    console.error("Error in sendAdminNotification:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user.id },
        { broadcastTo: { $in: ["all", req.user.role] }, userId: null },
      ],
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error("Error in getNotifications:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const stats = await ActivityStats.findOne({ userId: req.user.id });
    res.json(stats || { postsCount: 0, commentsCount: 0, likesGiven: 0, groupsJoined: 0, chatMessages: 0 });
  } catch (err) {
    console.error("Error in getActivityStats:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};