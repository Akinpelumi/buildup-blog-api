import db from '../config/db/index.js';
import * as postModel from '../models/models.post.js';
import * as Helper from '../utils/utils.helper.js';

export const fetchPosts = async(req, res) => {
  const { query } = req;
  if (parseInt(query.per_page) > 100) {
    return res.status(422).json({
        status: 'error',
        code: 422,
        message: 'Unprocessable entity, kindly check your per_page'
    })
  }

  const { offset, limit } = Helper.paginationOffsetLimit(query);

  const posts = await postModel.fetchPosts(offset, limit);
  const totalPosts = await postModel.fetchPostsCount();

  const totalPostsCount = parseInt(totalPosts.count);
  const totalPages = Helper.paginationTotalPages(totalPostsCount, limit);

  return res.status(200).json({
    status: 'success',
    message: 'Blog posts retrieved successfully',
    data: {
      page: parseInt(query.page) || 1,
      total_count: totalPostsCount,
      total_pages: parseInt(totalPages),
      posts
    }
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

// Fetch single post by ID with first 5 comments
export const fetchPostById = async(req, res) => {
    try {
        const { params: { postId } } = req;

        const post = await postModel.fetchPostById(postId);
        
        if (!post) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'Post does not exist'
            })
        }

        // Fetch first 5 comments for the post
        const comments = await postModel.fetchPostComments(postId, 0, 5);
        const commentsCount = await postModel.fetchPostCommentsCount(postId);

        return res.status(200).json({
            status: 'success',
            message: 'Post retrieved successfully',
            data: {
                post,
                comments,
                comments_count: parseInt(commentsCount.count)
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};

// Fetch paginated comments for a post
export const fetchPostComments = async(req, res) => {
    try {
        const { params: { postId }, query } = req;

        const { offset, limit } = Helper.paginationOffsetLimit(query);

        const comments = await postModel.fetchPostComments(postId, offset, limit);
        const totalComments = await postModel.fetchPostCommentsCount(postId);

        const totalCommentsCount = parseInt(totalComments.count);
        const totalPages = Helper.paginationTotalPages(totalCommentsCount, limit);

        return res.status(200).json({
            status: 'success',
            message: 'Comments retrieved successfully',
            data: {
                page: parseInt(query.page) || 1,
                total_count: totalCommentsCount,
                total_pages: parseInt(totalPages),
                comments
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};

// Fetch posts by category with pagination
export const fetchPostsByCategory = async(req, res) => {
    try {
        const { params: { categoryId }, query } = req;

        const { offset, limit } = Helper.paginationOffsetLimit(query);

        const posts = await postModel.fetchPostsByCategory(categoryId, offset, limit);
        const totalPosts = await postModel.fetchPostsByCategoryCount(categoryId);

        const totalPostsCount = parseInt(totalPosts.count);
        const totalPages = Helper.paginationTotalPages(totalPostsCount, limit);

        return res.status(200).json({
            status: 'success',
            message: 'Posts retrieved successfully',
            data: {
                page: parseInt(query.page) || 1,
                total_count: totalPostsCount,
                total_pages: parseInt(totalPages),
                category_id: parseInt(categoryId),
                posts
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};

// Search posts by title or content
export const searchPosts = async(req, res) => {
    try {
        const { query } = req;

        if (!query.searchValue) {
            return res.status(422).json({
                status: 'error',
                code: 422,
                message: 'Search query parameter q is required'
            })
        }

        const searchTerm = query.searchValue.trim();
        const { offset, limit } = Helper.paginationOffsetLimit(query);

        const posts = await postModel.searchPosts(searchTerm, offset, limit);
        const totalPosts = await postModel.searchPostsCount(searchTerm);

        const totalPostsCount = parseInt(totalPosts.count);
        const totalPages = Helper.paginationTotalPages(totalPostsCount, limit);

        return res.status(200).json({
            status: 'success',
            message: 'Search results retrieved successfully',
            data: {
                page: parseInt(query.page) || 1,
                total_count: totalPostsCount,
                total_pages: parseInt(totalPages),
                search_term: searchTerm,
                posts
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};

// Fetch trending posts
export const fetchTrendingPosts = async(req, res) => {
    try {
        const { query } = req;
        const limit = parseInt(query.limit) || 10;

        const posts = await postModel.fetchTrendingPosts(limit);

        return res.status(200).json({
            status: 'success',
            message: 'Trending posts retrieved successfully',
            data: {
                posts
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};

// Fetch related posts (same category)
export const fetchRelatedPosts = async(req, res) => {
    try {
        const { params: { postId }, post, query } = req;
        const limit = parseInt(query.limit) || 5;

        const relatedPosts = await postModel.fetchRelatedPosts(post.category, postId, limit);

        return res.status(200).json({
            status: 'success',
            message: 'Related posts retrieved successfully',
            data: {
                post_id: parseInt(postId),
                related_posts: relatedPosts
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
};
