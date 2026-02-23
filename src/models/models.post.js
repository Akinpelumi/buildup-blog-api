import db from "../config/db/index.js";
import queries from "../queries/queries.post.js";

// Fetch all posts with pagination, including category name
export const fetchPosts = async (offset, limit) => {
    const posts = await db.any(queries.listAllPosts, [parseInt(offset), parseInt(limit)]);
    return posts;
};

export const fetchPostsCount = async () => {
    const posts = await db.oneOrNone(queries.fetchPostsCount, [ true, 'published' ]);
    return posts;
}

export const postExists = async (postId) => {
    const post = await db.oneOrNone(queries.postExists, [ postId ]);
    return post;
};

export const postComment = async (postId, user_id, comment) => {
    const newPost = await db.oneOrNone(queries.postComment, [ postId, user_id, comment ]);
    return newPost;
};

export const likeUnlikePost = async (postId, action) => {
    if (action === 'like') {
        return await db.one(queries.likePost, [ postId ]);
    }
    return await db.one(queries.unlikePost, [ postId ]);
}

// Fetch single post by ID, including category name
export const fetchPostById = async (postId) => {
    const post = await db.oneOrNone(queries.fetchPostById, [postId]);
    if (post) {
        await db.none(queries.incrementPostViews, [postId]);
    }
    return post;
};

// Fetch comments for a post with pagination
export const fetchPostComments = async (postId, offset, limit) => {
    const comments = await db.any(queries.fetchPostComments, [postId, parseInt(offset), parseInt(limit)]);
    return comments;
};

export const fetchPostCommentsCount = async (postId) => {
    const count = await db.one(queries.fetchPostCommentsCount, [postId]);
    return count;
};

// Fetch posts by category with pagination, including category name
export const fetchPostsByCategory = async (categoryId, offset, limit) => {
    const posts = await db.any(queries.fetchPostsByCategory, [categoryId, parseInt(offset), parseInt(limit)]);
    return posts;
};

export const fetchPostsByCategoryCount = async (categoryId) => {
    const count = await db.one(queries.fetchPostsByCategoryCount, [categoryId]);
    return count;
};

// Search posts by title or content, including category name
export const searchPosts = async (searchTerm, offset, limit) => {
    const term = `%${searchTerm}%`;
    const posts = await db.any(queries.searchPosts, [term, parseInt(offset), parseInt(limit)]);
    return posts;
};

export const searchPostsCount = async (searchTerm) => {
    const term = `%${searchTerm}%`;
    const count = await db.one(queries.searchPostsCount, [term]);
    return count;
};

// Fetch trending posts, including category name
export const fetchTrendingPosts = async (limit = 10) => {
    const posts = await db.any(queries.fetchTrendingPosts, [parseInt(limit)]);
    return posts;
};

// Fetch related posts (same category, excluding original), including category name
export const fetchRelatedPosts = async (category, postId, limit = 5) => {
    const posts = await db.any(queries.fetchRelatedPosts, [category, postId, parseInt(limit)]);
    return posts;
};

// Check if category exists
export const checkCategoryExists = async (categoryId) => {
    const category = await db.oneOrNone(queries.checkCategoryExists, [categoryId]);
    return category;
};