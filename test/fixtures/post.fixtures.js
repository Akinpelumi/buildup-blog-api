// Test category ID (uses existing seeded category 'scifi' = 2)
export const TEST_CATEGORY_ID = 2;

// Test posts data - multiple posts in same category for related posts testing
export const testPosts = [
    {
        title: 'Test Post One - Tech Article',
        content: 'This is the first test post about technology and programming.',
        category: TEST_CATEGORY_ID,
        status: 'published',
        is_published: true,
        views_count: 100,
        likes_count: 50
    },
    {
        title: 'Test Post Two - More Tech',
        content: 'Second test post also about technology topics.',
        category: TEST_CATEGORY_ID,
        status: 'published',
        is_published: true,
        views_count: 200,
        likes_count: 30
    },
    {
        title: 'Test Post Three - Related Content',
        content: 'Third test post in the same category for related posts testing.',
        category: TEST_CATEGORY_ID,
        status: 'published',
        is_published: true,
        views_count: 50,
        likes_count: 100
    },
    {
        title: 'Searchable Article About JavaScript',
        content: 'This post contains searchable content about JavaScript and Node.js frameworks.',
        category: 1, // Different category (general)
        status: 'published',
        is_published: true,
        views_count: 150,
        likes_count: 75
    },
    {
        title: 'Unpublished Draft Post',
        content: 'This is a draft post that should not appear in search results.',
        category: TEST_CATEGORY_ID,
        status: 'draft',
        is_published: false,
        views_count: 0,
        likes_count: 0
    }
];

// Get db connection lazily to avoid initialization issues
const getDb = async () => {
    const db = await import('../../src/config/db/index.js');
    return db.default;
};

// Insert test posts and return their IDs
export const insertTestPosts = async () => {
    const db = await getDb();
    const insertedPosts = [];
    
    for (const post of testPosts) {
        const result = await db.one(`
            INSERT INTO blog_posts (title, content, category, status, is_published, views_count, likes_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, category, status
        `, [post.title, post.content, post.category, post.status, post.is_published, post.views_count, post.likes_count]);
        insertedPosts.push(result);
    }
    
    return insertedPosts;
};

// Insert a test user and return user_id
export const insertTestUser = async () => {
    const db = await getDb();
    const result = await db.one(`
        INSERT INTO blog_users (user_name, email, password, first_name, last_name, status, is_verified_account)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING user_id, user_name, email
    `, ['testuser', 'testuser@example.com', 'hashedpassword123', 'Test', 'User', 'active', true]);
    
    return result;
};

// Insert test comments for a post
export const insertTestComments = async (postId, userId, count = 10) => {
    const db = await getDb();
    const insertedComments = [];
    
    for (let i = 1; i <= count; i++) {
        const result = await db.one(`
            INSERT INTO blog_post_comments (post_id, user_id, comment)
            VALUES ($1, $2, $3)
            RETURNING id, post_id, comment
        `, [postId, userId, `Test comment number ${i} for pagination testing.`]);
        insertedComments.push(result);
    }
    
    return insertedComments;
};

// Get a published test post ID
export const getPublishedTestPostId = async () => {
    const db = await getDb();
    const post = await db.oneOrNone(`
        SELECT id FROM blog_posts 
        WHERE status = 'published' AND is_deleted = false 
        ORDER BY id DESC LIMIT 1
    `);
    return post ? post.id : null;
};

// Get count of posts in a category
export const getPostCountByCategory = async (categoryId) => {
    const db = await getDb();
    const result = await db.one(`
        SELECT COUNT(id) FROM blog_posts 
        WHERE category = $1 AND status = 'published' AND is_deleted = false
    `, [categoryId]);
    return parseInt(result.count);
};

// Clean up test data (optional - useful if tests need isolation)
export const cleanupTestPosts = async () => {
    const db = await getDb();
    await db.none(`DELETE FROM blog_post_comments WHERE comment LIKE 'Test comment%'`);
    await db.none(`DELETE FROM blog_posts WHERE title LIKE 'Test Post%' OR title LIKE 'Searchable%' OR title LIKE 'Unpublished%'`);
    await db.none(`DELETE FROM blog_users WHERE user_name = 'testuser'`);
};

// Fixture data for unit tests (no DB interaction)


// Fixture data for unit tests (no DB interaction)
export const mockPost = {
    id: 1,
    title: 'Mock Post Title',
    content: 'Mock post content for unit testing.',
    category: TEST_CATEGORY_ID,
    status: 'published',
    is_published: true,
    views_count: 10,
    likes_count: 5,
    author_first_name: 'John',
    author_last_name: 'Doe',
    created_at: new Date().toISOString()
};

export const mockComments = [
    { id: 1, post_id: 1, comment: 'First comment', user_name: 'user1', created_at: new Date().toISOString() },
    { id: 2, post_id: 1, comment: 'Second comment', user_name: 'user2', created_at: new Date().toISOString() }
];

export const mockCategory = {
    id: TEST_CATEGORY_ID,
    name: 'scifi'
};
