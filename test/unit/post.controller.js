import chai from 'chai';
import sinon from 'sinon';
import * as postController from '../../src/controllers/controllers.post.js';
import * as postModel from '../../src/models/models.post.js';
import { mockPost, mockComments } from '../fixtures/post.fixtures.js';

const { expect } = chai;

describe('Post Controller - Unit Tests', () => {
    let req, res, statusStub, jsonStub;

    beforeEach(() => {
        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        res = { status: statusStub };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('fetchPostById', () => {
        it('should return 200 with post data and comments', async () => {
            req = { params: { postId: '1' } };
            sinon.stub(postModel, 'fetchPostById').resolves(mockPost);
            sinon.stub(postModel, 'fetchPostComments').resolves(mockComments);
            sinon.stub(postModel, 'fetchPostCommentsCount').resolves({ count: '2' });

            await postController.fetchPostById(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].status).to.equal('success');
            expect(jsonStub.args[0][0].data).to.have.property('post');
            expect(jsonStub.args[0][0].data).to.have.property('comments');
            expect(jsonStub.args[0][0].data).to.have.property('comments_count', 2);
        });

        it('should return 400 when post not found', async () => {
            req = { params: { postId: '999' } };
            sinon.stub(postModel, 'fetchPostById').resolves(null);

            await postController.fetchPostById(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.args[0][0].message).to.equal('Post does not exist');
        });

        it('should return 500 on error', async () => {
            req = { params: { postId: '1' } };
            sinon.stub(postModel, 'fetchPostById').rejects(new Error('Database error'));

            await postController.fetchPostById(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.args[0][0].message).to.equal('Database error');
        });
    });

    describe('fetchPostComments', () => {
        it('should return 200 with paginated comments', async () => {
            req = { params: { postId: '1' }, query: { page: '1', per_page: '5' } };
            sinon.stub(postModel, 'fetchPostComments').resolves(mockComments);
            sinon.stub(postModel, 'fetchPostCommentsCount').resolves({ count: '10' });

            await postController.fetchPostComments(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data).to.have.property('comments');
            expect(jsonStub.args[0][0].data).to.have.property('total_count', 10);
            expect(jsonStub.args[0][0].data).to.have.property('total_pages', 2);
        });

        it('should return 500 on error', async () => {
            req = { params: { postId: '1' }, query: {} };
            sinon.stub(postModel, 'fetchPostComments').rejects(new Error('Database error'));

            await postController.fetchPostComments(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('fetchPostsByCategory', () => {
        it('should return 200 with posts filtered by category', async () => {
            req = { params: { categoryId: '2' }, query: { page: '1' } };
            sinon.stub(postModel, 'fetchPostsByCategory').resolves([mockPost]);
            sinon.stub(postModel, 'fetchPostsByCategoryCount').resolves({ count: '1' });

            await postController.fetchPostsByCategory(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data).to.have.property('posts');
            expect(jsonStub.args[0][0].data).to.have.property('category_id', 2);
        });

        it('should return 500 on error', async () => {
            req = { params: { categoryId: '2' }, query: {} };
            sinon.stub(postModel, 'fetchPostsByCategory').rejects(new Error('Database error'));

            await postController.fetchPostsByCategory(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('searchPosts', () => {
        it('should return 422 when q parameter is missing', async () => {
            req = { query: {} };

            await postController.searchPosts(req, res);

            expect(statusStub.calledWith(422)).to.be.true;
            expect(jsonStub.args[0][0].message).to.equal('Search query parameter q is required');
        });

        it('should return 200 with search results', async () => {
            req = { query: { q: 'javascript', page: '1' } };
            sinon.stub(postModel, 'searchPosts').resolves([mockPost]);
            sinon.stub(postModel, 'searchPostsCount').resolves({ count: '1' });

            await postController.searchPosts(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data).to.have.property('search_term', 'javascript');
            expect(jsonStub.args[0][0].data).to.have.property('posts');
        });

        it('should return 200 with empty results for no matches', async () => {
            req = { query: { q: 'nonexistent' } };
            sinon.stub(postModel, 'searchPosts').resolves([]);
            sinon.stub(postModel, 'searchPostsCount').resolves({ count: '0' });

            await postController.searchPosts(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data.posts).to.have.lengthOf(0);
            expect(jsonStub.args[0][0].data.total_count).to.equal(0);
        });

        it('should return 500 on error', async () => {
            req = { query: { q: 'test' } };
            sinon.stub(postModel, 'searchPosts').rejects(new Error('Database error'));

            await postController.searchPosts(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('fetchTrendingPosts', () => {
        it('should return 200 with trending posts', async () => {
            req = { query: {} };
            sinon.stub(postModel, 'fetchTrendingPosts').resolves([mockPost]);

            await postController.fetchTrendingPosts(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data).to.have.property('posts');
        });

        it('should use custom limit when provided', async () => {
            req = { query: { limit: '5' } };
            const fetchStub = sinon.stub(postModel, 'fetchTrendingPosts').resolves([]);

            await postController.fetchTrendingPosts(req, res);

            expect(fetchStub.calledWith(5)).to.be.true;
        });

        it('should return 500 on error', async () => {
            req = { query: {} };
            sinon.stub(postModel, 'fetchTrendingPosts').rejects(new Error('Database error'));

            await postController.fetchTrendingPosts(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('fetchRelatedPosts', () => {
        it('should return 200 with related posts', async () => {
            const relatedPosts = [{ ...mockPost, id: 2 }];
            req = { 
                params: { postId: '1' }, 
                post: { category: 2 }, 
                query: {} 
            };
            sinon.stub(postModel, 'fetchRelatedPosts').resolves(relatedPosts);

            await postController.fetchRelatedPosts(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.args[0][0].data).to.have.property('post_id', 1);
            expect(jsonStub.args[0][0].data).to.have.property('related_posts');
        });

        it('should use custom limit when provided', async () => {
            req = { 
                params: { postId: '1' }, 
                post: { category: 2 }, 
                query: { limit: '3' } 
            };
            const fetchStub = sinon.stub(postModel, 'fetchRelatedPosts').resolves([]);

            await postController.fetchRelatedPosts(req, res);

            expect(fetchStub.calledWith(2, '1', 3)).to.be.true;
        });

        it('should return 500 on error', async () => {
            req = { 
                params: { postId: '1' }, 
                post: { category: 2 }, 
                query: {} 
            };
            sinon.stub(postModel, 'fetchRelatedPosts').rejects(new Error('Database error'));

            await postController.fetchRelatedPosts(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });
});
