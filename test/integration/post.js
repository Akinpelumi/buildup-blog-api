import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/index.js';
import * as fixtures from '../fixtures/post.fixtures.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('Post Endpoints - Integration Tests', () => {
    let testPosts;
    let testUser;
    let testComments;

    before(async () => {
        // Insert test data (DB should already be migrated/reset before running tests)
        testPosts = await fixtures.insertTestPosts();
        testUser = await fixtures.insertTestUser();
        // Insert comments on the first published post
        const publishedPost = testPosts.find(p => p.status === 'published');
        if (publishedPost) {
            testComments = await fixtures.insertTestComments(publishedPost.id, testUser.user_id, 10);
        }
    });

    describe('GET /api/v1/posts', () => {
        it('should return paginated posts', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('posts');
                    expect(res.body.data).to.have.property('total_count');
                    expect(res.body.data).to.have.property('total_pages');
                    expect(res.body.data).to.have.property('page');
                    done();
                });
        });

        it('should respect pagination parameters', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts?page=1&per_page=2')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts.length).to.be.at.most(2);
                    expect(res.body.data.page).to.equal(1);
                    done();
                });
        });
    });

    describe('GET /api/v1/posts/:postId', () => {
        it('should return post details with comments', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published');
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('post');
                    expect(res.body.data).to.have.property('comments');
                    expect(res.body.data).to.have.property('comments_count');
                    expect(res.body.data.comments).to.be.an('array');
                    done();
                });
        });

        it('should return 400 for non-existent post', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/99999')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal('error');
                    expect(res.body.message).to.equal('Post does not exist');
                    done();
                });
        });

        it('should increment views count on each fetch', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published');
            let initialViews;

            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}`)
                .end((err, res) => {
                    initialViews = res.body.data.post.views_count;
                    
                    // Fetch again
                    chai
                        .request(app)
                        .get(`/api/v1/posts/${publishedPost.id}`)
                        .end((err2, res2) => {
                            expect(res2.body.data.post.views_count).to.equal(initialViews + 1);
                            done();
                        });
                });
        });
    });

    describe('GET /api/v1/posts/:postId/comments', () => {
        it('should return paginated comments for a post', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published');
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}/comments`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('comments');
                    expect(res.body.data).to.have.property('total_count');
                    expect(res.body.data).to.have.property('total_pages');
                    done();
                });
        });

        it('should respect pagination for comments', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published');
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}/comments?page=1&per_page=3`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.comments.length).to.be.at.most(3);
                    done();
                });
        });

        it('should return 400 for non-existent post', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/99999/comments')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Post does not exist');
                    done();
                });
        });
    });

    describe('GET /api/v1/posts/category/:categoryId', () => {
        it('should return posts filtered by category', (done) => {
            chai
                .request(app)
                .get(`/api/v1/posts/category/${fixtures.TEST_CATEGORY_ID}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('posts');
                    expect(res.body.data).to.have.property('category_id', fixtures.TEST_CATEGORY_ID);
                    done();
                });
        });

        it('should return 400 for non-existent category', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/category/99999')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.status).to.equal('error');
                    expect(res.body.message).to.equal('Category does not exist');
                    done();
                });
        });

        it('should return empty array for category with no published posts', (done) => {
            // Category 3 (entertainment) has no test posts
            chai
                .request(app)
                .get('/api/v1/posts/category/3')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts).to.be.an('array');
                    done();
                });
        });
    });

    describe('GET /api/v1/posts/search', () => {
        it('should return 422 when q parameter is missing', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/search')
                .end((err, res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.status).to.equal('error');
                    expect(res.body.message).to.equal('Search query parameter q is required');
                    done();
                });
        });

        it('should return search results for matching query', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/search?q=javascript')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('search_term', 'javascript');
                    expect(res.body.data).to.have.property('posts');
                    expect(res.body.data.posts.length).to.be.at.least(1);
                    done();
                });
        });

        it('should return empty results for non-matching query', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/search?q=xyznonexistent123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts).to.have.lengthOf(0);
                    expect(res.body.data.total_count).to.equal(0);
                    done();
                });
        });

        it('should search in both title and content', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/search?q=Node.js')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts.length).to.be.at.least(1);
                    done();
                });
        });

        it('should be case insensitive', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/search?q=JAVASCRIPT')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts.length).to.be.at.least(1);
                    done();
                });
        });
    });

    describe('GET /api/v1/posts/trending', () => {
        it('should return trending posts', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/trending')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('posts');
                    expect(res.body.data.posts).to.be.an('array');
                    done();
                });
        });

        it('should respect limit parameter', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/trending?limit=3')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.posts.length).to.be.at.most(3);
                    done();
                });
        });

        it('should order by trending score', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/trending')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    const posts = res.body.data.posts;
                    if (posts.length > 1) {
                        // First post should have higher or equal trending score
                        expect(parseFloat(posts[0].trending_score))
                            .to.be.at.least(parseFloat(posts[1].trending_score));
                    }
                    done();
                });
        });
    });

    describe('GET /api/v1/posts/:postId/related', () => {
        it('should return related posts in same category', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published' && p.category === fixtures.TEST_CATEGORY_ID);
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}/related`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.equal('success');
                    expect(res.body.data).to.have.property('post_id', publishedPost.id);
                    expect(res.body.data).to.have.property('related_posts');
                    expect(res.body.data.related_posts).to.be.an('array');
                    done();
                });
        });

        it('should exclude the original post from related posts', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published' && p.category === fixtures.TEST_CATEGORY_ID);
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}/related`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    const relatedIds = res.body.data.related_posts.map(p => p.id);
                    expect(relatedIds).to.not.include(publishedPost.id);
                    done();
                });
        });

        it('should respect limit parameter', (done) => {
            const publishedPost = testPosts.find(p => p.status === 'published');
            chai
                .request(app)
                .get(`/api/v1/posts/${publishedPost.id}/related?limit=2`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.related_posts.length).to.be.at.most(2);
                    done();
                });
        });

        it('should return 400 for non-existent post', (done) => {
            chai
                .request(app)
                .get('/api/v1/posts/99999/related')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Post does not exist');
                    done();
                });
        });
    });
});
