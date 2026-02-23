import chai from 'chai';
import sinon from 'sinon';
import db from '../../src/config/db/index.js';
import * as postModel from '../../src/models/models.post.js';
import { mockPost, mockComments, mockCategory } from '../fixtures/post.fixtures.js';

const { expect } = chai;

describe('Post Model - Unit Tests', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('fetchPostById', () => {
        it('should return post when found and increment views', async () => {
            const oneOrNoneStub = sinon.stub(db, 'oneOrNone').resolves(mockPost);
            const noneStub = sinon.stub(db, 'none').resolves();

            const result = await postModel.fetchPostById(1);

            expect(result).to.deep.equal(mockPost);
            expect(oneOrNoneStub.calledOnce).to.be.true;
            expect(noneStub.calledOnce).to.be.true;
        });

        it('should return null when post not found and not increment views', async () => {
            const oneOrNoneStub = sinon.stub(db, 'oneOrNone').resolves(null);
            const noneStub = sinon.stub(db, 'none').resolves();

            const result = await postModel.fetchPostById(999);

            expect(result).to.be.null;
            expect(oneOrNoneStub.calledOnce).to.be.true;
            expect(noneStub.called).to.be.false;
        });
    });

    describe('fetchPostComments', () => {
        it('should return comments array with pagination', async () => {
            sinon.stub(db, 'any').resolves(mockComments);

            const result = await postModel.fetchPostComments(1, 0, 10);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.have.property('comment');
        });

        it('should return empty array when no comments', async () => {
            sinon.stub(db, 'any').resolves([]);

            const result = await postModel.fetchPostComments(1, 0, 10);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(0);
        });
    });

    describe('fetchPostCommentsCount', () => {
        it('should return count object', async () => {
            sinon.stub(db, 'one').resolves({ count: '5' });

            const result = await postModel.fetchPostCommentsCount(1);

            expect(result).to.have.property('count', '5');
        });
    });

    describe('fetchPostsByCategory', () => {
        it('should return posts filtered by category', async () => {
            const posts = [mockPost, { ...mockPost, id: 2 }];
            sinon.stub(db, 'any').resolves(posts);

            const result = await postModel.fetchPostsByCategory(2, 0, 10);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(2);
        });
    });

    describe('fetchPostsByCategoryCount', () => {
        it('should return count for category', async () => {
            sinon.stub(db, 'one').resolves({ count: '3' });

            const result = await postModel.fetchPostsByCategoryCount(2);

            expect(result).to.have.property('count', '3');
        });
    });

    describe('searchPosts', () => {
        it('should search posts with wildcard term', async () => {
            const anyStub = sinon.stub(db, 'any').resolves([mockPost]);

            const result = await postModel.searchPosts('javascript', 0, 10);

            expect(result).to.be.an('array');
            expect(anyStub.args[0][1][0]).to.equal('%javascript%');
        });

        it('should return empty array for no matches', async () => {
            sinon.stub(db, 'any').resolves([]);

            const result = await postModel.searchPosts('nonexistent', 0, 10);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(0);
        });
    });

    describe('searchPostsCount', () => {
        it('should return search results count with wildcard term', async () => {
            const oneStub = sinon.stub(db, 'one').resolves({ count: '2' });

            const result = await postModel.searchPostsCount('javascript');

            expect(result).to.have.property('count', '2');
            expect(oneStub.args[0][1][0]).to.equal('%javascript%');
        });
    });

    describe('fetchTrendingPosts', () => {
        it('should return trending posts with default limit', async () => {
            const posts = [mockPost];
            const anyStub = sinon.stub(db, 'any').resolves(posts);

            const result = await postModel.fetchTrendingPosts();

            expect(result).to.be.an('array');
            expect(anyStub.args[0][1][0]).to.equal(10);
        });

        it('should use custom limit when provided', async () => {
            const anyStub = sinon.stub(db, 'any').resolves([]);

            await postModel.fetchTrendingPosts(5);

            expect(anyStub.args[0][1][0]).to.equal(5);
        });
    });

    describe('fetchRelatedPosts', () => {
        it('should return related posts excluding original', async () => {
            const relatedPosts = [{ ...mockPost, id: 2 }, { ...mockPost, id: 3 }];
            const anyStub = sinon.stub(db, 'any').resolves(relatedPosts);

            const result = await postModel.fetchRelatedPosts(2, 1, 5);

            expect(result).to.be.an('array');
            expect(anyStub.args[0][1]).to.deep.equal([2, 1, 5]);
        });

        it('should use default limit of 5', async () => {
            const anyStub = sinon.stub(db, 'any').resolves([]);

            await postModel.fetchRelatedPosts(2, 1);

            expect(anyStub.args[0][1][2]).to.equal(5);
        });
    });

    describe('checkCategoryExists', () => {
        it('should return category when exists', async () => {
            sinon.stub(db, 'oneOrNone').resolves(mockCategory);

            const result = await postModel.checkCategoryExists(2);

            expect(result).to.deep.equal(mockCategory);
        });

        it('should return null when category does not exist', async () => {
            sinon.stub(db, 'oneOrNone').resolves(null);

            const result = await postModel.checkCategoryExists(999);

            expect(result).to.be.null;
        });
    });
});
