import db from '../config/db/index.js';
import * as postModel from '../models/models.post.js';

export const fetchPosts = async(req, res) => {
  const posts = await postModel.fetchPosts();
  return res.status(200).json({
    status: 'success',
    message: 'Blog posts retrieved successfully',
    data: posts
  });
};

export const commentOnPost = async(req, res) => {
    try {
        const { body: { comment }, params: { postId }, user } = req;

        if (!comment) {
            return res.status(422).json({
                status: 'error',
                code: 422,
                message: 'comment is required'
            })
        }

        const postComment = await postModel.postComment(postId, user.user_id, comment.trim());
        
        return res.status(201).json({
            status: 'success',
            code: 201,
            message: 'Comment posted successfully',
            data: postComment
        })
    } catch(err) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: err.message
        })
    }
};

export const likeUnlikePost = async(req, res) => {
    try {
        const { params: { postId }, query: { action } } = req;

        if (!action && (action !== 'like' || action !== 'unlike')) {
            return res.status(422).json({
                status: 'error',
                code: 422,
                message: 'action query parameter is required and must be either like or unlike'
            })
        }

        let post = {};
        if (action === 'like') {
            post = await postModel.likeUnlikePost(postId, action);
        } else {
            post = await postModel.likeUnlikePost(postId, action);
        }

        const actionDecision = action === 'like' ? 'liked' : 'unliked';

        return res.status(200).json({
            status: 'success',
            code: 200,
            message: `Post ${actionDecision} successfully`,
            data: post
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};
