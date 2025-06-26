const { getIO } = require("../../socket");
const postModel = require("../models/socialwallPostModel");

exports.createSocialWallPost = async (req, res, next) => {
    const { content, images, shareOn, userId, eventId } = req.body;

    if (!content || !images || !shareOn || !userId || !eventId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const post = await postModel.createPost({ content, images, shareOn, userId, eventId });

        const event = await postModel.getEventUsers(eventId);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        if (!Array.isArray(event.UserEvent)) {
            event.UserEvent = [];
        }

        for (const userEvent of event.UserEvent) {
            const user = userEvent.user;
            if (user.id !== Number(userId)) {
                const notification = await postModel.createNotification({
                    message: `New post in event ${eventId}`,
                    recipientId: user.id,
                });

                getIO().to(`event:${eventId}`).emit(`notification-${user.id}`, notification);
                console.log("Notification created for user:", user.id, notification);
            }
        }

        getIO().to(`event:${eventId}`).emit("new-post", post);

        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
        next(error);
    }
};


exports.getEventSocialWallPosts = async (req, res, next) => {
    const { eventId } = req.params;
    try {
        const posts = await postModel.getPostsByEvent(Number(eventId));
        res.status(200).json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
        // next(err); // ✅ Optional, remove if already sending response
    }
};


exports.getSocialPostById = async (req, res) => {
    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({ success: false, message: 'Post ID is required' });
    }

    try {
        const post = await postModel.getPostById(Number(postId));

        if (!post) {
            return res.status(404).json({
                success: false, message: 'Post not found'
            });
        }

        res.status(200).json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}



exports.likePost = async (req, res) => {
    const { postId, userId } = req.body;

    try {
        const like = await postModel.createLike({ postId, userId });
        const post = await postModel.getPostById(postId);

        if (post.userId !== Number(userId)) {
            const notification = await postModel.createNotification({
                message: `Someone liked your post`,
                recipientId: post.userId,
            });

            getIO().to(`event:${post.eventId}`).emit(`notification-${post.userId}`, notification);
            console.log("Notification created for user:", post.userId, notification);
        }

        getIO().to(`event:${post.eventId}`).emit(`like-${postId}`, { postId, userId });

        res.status(200).json({ message: "Post liked", like });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

