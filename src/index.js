import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import routes from './routes/index.js';


const app = express();

app.use(helmet());
app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Welcome to BuildUp Backend Cohort One' });
});

// Other routes
routes(app); 

// Error Handlers
// 404 Error Handling
app.use((_req,res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  })
});

// internal server error, Error Handling
app.use((_req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Ooooops! Something broke somewhere, we will look into it, contact us'
  })
})

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
});

// Assignment 1 

// // add a new migration file 
// 1.⁠ ⁠Remove the NOT NULL constraint on authors column on blog_posts table using ALTER TABLE command
// 2.⁠ ⁠Insert into blog_posts table blog posts with with different statuses 

// // Endpoints
// 3.⁠ ⁠Create an endpoint to fetch all published blog posts
// 4.⁠ ⁠Create an endpoint to comment on a blog post (Restricted to only verified and authenticated users)
// 5.⁠ ⁠Create an endpoint to like AND unlike a blog post (Restricted to only verified and authenticated users) (Same endpoint using query params to handle the two scenarios for like and unlike)
// 6.⁠ ⁠Create an endpoint to delete user own comment on a blog post (Restricted to only verified and authenticated users)


// Assignment 2

// // add a new migration file 
//  7.⁠ ⁠Create a user_type enum with values "user" and "admin"
//  8.⁠ ⁠Add a column user_type to blog_users table with Default value of “user”
//  9.⁠ ⁠Seed an admin user into the blog_users table with user_type “admin” (Seed the hashed password for the admin, but remember the plain password)

// // Endpoints
// 10.⁠ ⁠Create an endpoint for admins to create a blog author profile (Strictly for logged in admins)
// 11.⁠ ⁠Create an endpoint for admins to edit a blog author profile (Strictly for logged in admins)
// 12.⁠ ⁠Create an endpoint for admins to delete a blog author profile (Strictly for logged in admins)
// 13.⁠ ⁠Create an endpoint to fetch blog authors profile (Strictly for logged in admins)
// 14.⁠ ⁠Create an endpoint to fetch single blog author profile (Strictly for logged in admins)
// 15.⁠ ⁠Create an endpoint for admins to add blog posts (attached to an existing author on the platform) (Strictly for logged in admins)
// 16.⁠ ⁠Create an endpoint for admins to edit a blog post (Strictly for logged in admins)
// 17.⁠ ⁠Create an endpoint for admins to delete a blog post (Soft delete) (Strictly for logged in admins)
// 18.⁠ ⁠Create an endpoint for all users to view extended details of a blog post (the blog authors details, the comments under the posts, the likes under the post)

// Assignment 3
// // add a new migration file 
// 19.⁠ ⁠Create a media_uploads table with the following columns id (Primary Key), uploaded_by (references blog_users user_id), file_url, file_type(ENUM TYPE)(authors, users, posts), mime_type, size, cloudinary_public_id(Gotten from cloudinary returned response), created_at, updated_at, is_deleted
// 20. Create an endpoint for single file upload using express-fileupload package with disk storage using cloudinary for cloud storage
// 21. Create an endpoint for multiple file upload using multer package with disk storage using cloudinary for cloud storage
// 22. Create an endpoint to fetch a users uploaded files (Strictly for logged in users)
// 23. Create an endpoint to fetch uploaded files based on fileType query param (Strictly for logged in users)
// 24. Create an endpoint to delete a user uploaded file (Strictly for logged in users) (Delete also on cloudinary)