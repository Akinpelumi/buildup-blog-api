import db from "../config/db/index.js";
import queries from "../queries/queries.post.js";

export const fetchPosts = async (offset, limit) => {
    const posts = await db.any(queries.fetchPosts, [ true, 'published', parseInt(offset), parseInt(limit) ]);
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