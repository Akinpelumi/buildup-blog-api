import * as postModel from '../models/models.post.js';

export const checkIfPostExists = async (req, res, next) => {
    const { params: { postId } } = req;

    const postExists = await postModel.postExists(postId);
    
    if (!postExists) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Post does not exist'
        })
    }
    req.post = postExists;
    return next();
}

export const checkIfCategoryExists = async (req, res, next) => {
    const { params: { categoryId } } = req;

    const categoryExists = await postModel.checkCategoryExists(categoryId);
    
    if (!categoryExists) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Category does not exist'
        })
    }
    req.category = categoryExists;
    return next();
}