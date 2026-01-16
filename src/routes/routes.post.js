import { Router } from "express";
import * as postController from '../controllers/controllers.post.js';
import * as authMiddleware from '../middlewares/middlewares.auth.js';
import * as postMiddleware from '../middlewares/middlewares.post.js';

const router = Router();

router.use('/posts', postController.fetchPosts);
router.use('/posts/:postId/comment', 
    authMiddleware.verifyToken, 
    postMiddleware.checkIfPostExists, 
    postController.commentOnPost
);
router.use('/posts/:postId', 
    authMiddleware.verifyToken,
    postMiddleware.checkIfPostExists, 
    postController.likeUnlikePost
);

export default router;
