export default {
    fetchPosts: `
        SELECT * 
        FROM blog_posts 
        WHERE is_published = $1 
        AND status = $2 
        ORDER BY created_at DESC 
        OFFSET $3 
        LIMIT $4`,
    fetchPostsCount: 'SELECT COUNT(id) FROM blog_posts  WHERE is_published = $1 AND status = $2',
    postExists: `SELECT id, title, content, category FROM blog_posts WHERE id = $1 AND status = 'published'`,
    postComment: `
        INSERT INTO blog_post_comments (post_id, user_id, comment) 
        VALUES ($1, $2, $3) 
        RETURNING id, post_id, comment, views_count, likes_count, is_deleted, created_at`,
    likePost: 'UPDATE blog_posts SET updated_at = NOW(), likes_count = likes_count + 1 WHERE id = $1 RETURNING id, title, content, status, likes_count, views_count',
    unlikePost: 'UPDATE blog_posts SET updated_at = NOW(), likes_count = likes_count - 1 WHERE id = $1 RETURNING id, title, content, status, likes_count, views_count',
    
    // Single post with author details
    fetchPostById: `
           SELECT bp.*, a.name as author_name, c.name as category_name
            FROM blog_posts bp
            LEFT JOIN authors a ON bp.author = a.author_id
            LEFT JOIN categories c ON bp.category = c.id
            WHERE bp.id = $1 AND bp.status = 'published' AND bp.is_deleted = false`,
    
    // Increment views count
    incrementPostViews: `
        UPDATE blog_posts 
        SET views_count = views_count + 1, updated_at = NOW() 
        WHERE id = $1`,
    
    // Post comments with user info
    fetchPostComments: `
        SELECT c.*, u.user_name, u.first_name, u.last_name
        FROM blog_post_comments c
        LEFT JOIN blog_users u ON c.user_id = u.user_id
        WHERE c.post_id = $1 AND c.is_deleted = false
        ORDER BY c.created_at DESC
        OFFSET $2 LIMIT $3`,
    
    fetchPostCommentsCount: `
        SELECT COUNT(id) FROM blog_post_comments 
        WHERE post_id = $1 AND is_deleted = false`,
    
    // List all posts with category name
    listAllPosts: `
        SELECT bp.*, c.name AS category_name
        FROM blog_posts bp
        JOIN categories c ON bp.category = c.id
        WHERE bp.status = 'published' AND bp.is_deleted = false
        ORDER BY bp.created_at DESC
        OFFSET $1 LIMIT $2
    `,

    // Posts by category
    fetchPostsByCategory: `
        SELECT bp.*, c.name AS category_name
        FROM blog_posts bp
        JOIN categories c ON bp.category = c.id
        WHERE bp.category = $1 AND bp.status = 'published' AND bp.is_deleted = false
        ORDER BY bp.created_at DESC
        OFFSET $2 LIMIT $3
    `,

    fetchPostsByCategoryCount: `
        SELECT COUNT(bp.id) FROM blog_posts bp
        WHERE bp.category = $1 AND bp.status = 'published' AND bp.is_deleted = false
    `,

    // Search posts
    searchPosts: `
        SELECT bp.*, c.name AS category_name
        FROM blog_posts bp
        JOIN categories c ON bp.category = c.id
        WHERE (bp.title ILIKE $1 OR bp.content ILIKE $1)
        AND bp.status = 'published' AND bp.is_deleted = false
        ORDER BY bp.created_at DESC
        OFFSET $2 LIMIT $3
    `,

    searchPostsCount: `
        SELECT COUNT(bp.id) FROM blog_posts bp
        WHERE (bp.title ILIKE $1 OR bp.content ILIKE $1)
        AND bp.status = 'published' AND bp.is_deleted = false
    `,

    // Trending posts - time-weighted popularity
    fetchTrendingPosts: `
        SELECT bp.*, c.name AS category_name,
            (bp.views_count + bp.likes_count * 2) / (EXTRACT(EPOCH FROM NOW() - bp.created_at) / 86400 + 1) as trending_score
        FROM blog_posts bp
        JOIN categories c ON bp.category = c.id
        WHERE bp.status = 'published' AND bp.is_deleted = false
        ORDER BY trending_score DESC
        LIMIT $1
    `,

    // Related posts - same category, exclude original
    fetchRelatedPosts: `
        SELECT bp.*, c.name AS category_name
        FROM blog_posts bp
        JOIN categories c ON bp.category = c.id
        WHERE bp.category = $1 AND bp.id != $2 AND bp.status = 'published' AND bp.is_deleted = false
        ORDER BY bp.created_at DESC
        LIMIT $3
    `,

    // Category existence check
    checkCategoryExists: `SELECT id, name FROM categories WHERE id = $1`
}