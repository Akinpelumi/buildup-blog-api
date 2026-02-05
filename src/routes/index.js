import authRoutes from './routes.auth.js';
import postRoutes from './routes.post.js';
import userRoutes from './routes.user.js';
import paymentRoutes from './routes.payment.js';

const routes = (app) => {
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/posts', postRoutes);
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/payment', paymentRoutes);
}

export default routes;
