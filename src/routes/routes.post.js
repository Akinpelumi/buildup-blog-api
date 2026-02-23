import { Router } from "express";
import * as postController from '../controllers/controllers.post.js';
import * as authMiddleware from '../middlewares/middlewares.auth.js';
import * as postMiddleware from '../middlewares/middlewares.post.js';

const router = Router();

// Static routes (must come before dynamic :postId routes)
router.get('/search', postController.searchPosts);
router.get('/trending', postController.fetchTrendingPosts);
router.get('/category/:categoryId', 
    postMiddleware.checkIfCategoryExists, 
    postController.fetchPostsByCategory
);

// List all posts
router.get('/', postController.fetchPosts);

// Single post routes
router.get('/:postId', 
    postMiddleware.checkIfPostExists, 
    postController.fetchPostById
);
router.get('/:postId/comments', 
    postMiddleware.checkIfPostExists, 
    postController.fetchPostComments
);
router.get('/:postId/related', 
    postMiddleware.checkIfPostExists, 
    postController.fetchRelatedPosts
);

// Post actions (require authentication)
router.post('/:postId/comment', 
    authMiddleware.verifyToken, 
    postMiddleware.checkIfPostExists, 
    postController.commentOnPost
);
router.post('/:postId', 
    authMiddleware.verifyToken,
    postMiddleware.checkIfPostExists, 
    postController.likeUnlikePost
);

export default router;
