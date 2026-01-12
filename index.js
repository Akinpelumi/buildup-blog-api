import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import pgp from 'pg-promise';
import bcrypt from 'bcryptjs';
import Crypto from 'crypto';
import jwt from 'jsonwebtoken';

const app = express();

app.use(helmet());
app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

const pg = pgp({ noWarnings: true });

const cn = {
  connectionString: process.env.DATABASE_URL,
  max: 1000
};

export const db = pg(cn);

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Welcome to BuildUp Backend Cohort One' });
})

app.post('/register', async (req, res) => {
    const { email, password, username, first_name, last_name } = req.body
    if (!email || !username || !password || !first_name) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email, username, password and first_name are required'
        })
    }

    if (!email.includes('@')) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email is invalid'
        })
    }
    
    if (password.length < 10) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'password length should not be less than 10'
        })
    }

    if (!/[A-Z]/g.test(password) || !/[a-z]/g.test(password) || !/[0-9]/g.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g.test(password)) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'password should contain at least one uppercase, lowercase, number and special character'
        })
    }

    if (username.length < 3 || first_name.length < 3 || last_name.length < 3) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'username, first_name and last_name should not be less than 3 characters'
        })
    }

    const existingEmail = await db.oneOrNone('SELECT id, email, user_name FROM blog_users WHERE email = $1', [ email.trim().toLowerCase() ]);
    if (existingEmail) {
        return res.status(409).json({
            status: 'error',
            code: 409,
            message: 'email already exists'
        })
    }
    const existingUserName = await db.oneOrNone('SELECT id, email, user_name FROM blog_users WHERE user_name = $1', [ username.trim().toLowerCase() ]);
    if (existingUserName) {
        return res.status(409).json({
            status: 'error',
            code: 409,
            message: 'username already exists'
        })
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // generate unique identifier/otp
    const verificationCode = Crypto.randomInt(0, 1000000).toString().padStart(6, '7');
    const verificationCodeDuration = 10; // in minutes
    const verificationCodeExpireAt = new Date(Date.now() + verificationCodeDuration * 60 * 1000);

    // save to the DB
    const newUser = await db.one(`
        INSERT INTO blog_users (email, user_name, password, first_name, last_name, verification_code, verification_code_expire_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email, user_name, first_name, last_name, verification_code_expire_at, created_at
    `, [ 
        email.trim().toLowerCase(), 
        username.trim().toLowerCase(), 
        hash, 
        first_name.trim().toLowerCase(), 
        last_name ? last_name.trim().toLowerCase() : null,
        verificationCode,
        verificationCodeExpireAt
    ])

    // send verification email to users

    return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Account created successfully',
        data: newUser
    })
})

app.post('/verify-account', async (req, res) => {
    const { verification_code, email } = req.body;

    if (!verification_code || !email) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'verification_code and email are required'
        })
    }

    if (verification_code.length !== 6) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'verification_code must be 6 digits'
        })
    }

    const userDetails = await db.oneOrNone('SELECT id, user_id, email, is_verified_account, verification_code, verification_code_expire_at FROM blog_users WHERE email = $1 AND is_deleted = FALSE', [ email.trim().toLowerCase() ]);
    if (!userDetails) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Invalid email, user does not exist'
        })
    }

    if (userDetails.is_verified_account) {
        return res.status(400).json({
            status: 'error',
             code: 400,
             message: 'Account already verified'
        })
    }

    if (userDetails.verification_code_expire_at < new Date()) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Verification code has expired'
        })
    }

    if (verification_code !== userDetails.verification_code) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid verification code'
        })
    }

    const verifiedUser = await db.one(`
        UPDATE blog_users
          SET updated_at = NOW(),
          is_verified_account = TRUE,
          status = 'active',
          verification_code = NULL,
          verification_code_expire_at = NULL
        WHERE email = $1
        RETURNING id, user_id, email, first_name, last_name, is_verified_account, status, created_at, updated_at
        `, [ email.trim().toLowerCase() ])

    // send welcome email to users

    return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Account verified successfully',
        data: verifiedUser
    })
})

app.post('/resend-verification-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email is required'
        })
    }

    const userDetails = await db.oneOrNone('SELECT id, user_id, email, is_verified_account, verification_code, verification_code_expire_at FROM blog_users WHERE email = $1 AND is_deleted = FALSE', [ email.trim().toLowerCase() ]);
    if (!userDetails) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Invalid email, user does not exist'
        })
    }

    if (userDetails.is_verified_account) {
        return res.status(400).json({
            status: 'error',
             code: 400,
             message: 'Account already verified'
        })
    }

   // generate unique identifier/otp
    const verificationCode = Crypto.randomInt(0, 1000000).toString().padStart(6, '7');
    const verificationCodeDuration = 10; // in minutes
    const verificationCodeExpireAt = new Date(Date.now() + verificationCodeDuration * 60 * 1000);

    const updatedUser = await db.oneOrNone('UPDATE blog_users SET updated_at = NOW(), verification_code = $2, verification_code_expire_at = $3 WHERE email = $1 RETURNING id, user_id, email, verification_code, verification_code_expire_at', 
        [ email.trim().toLowerCase(), verificationCode.trim(), verificationCodeExpireAt])

    // send email of new otp verification code

    if (process.env.NODE_ENV === 'production') {
        delete updatedUser.verification_code;
    }

    return res.status(200).json({
        status: 'success',
         code: 200,
         message: 'Verification code resent successfully',
         data: updatedUser
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'username and password are required'
        })
    }

    const userExists = await db.oneOrNone(`
        SELECT id, user_id, email, user_name, first_name, last_name, is_verified_account, status, created_at 
        FROM blog_users 
        WHERE (user_name = $1 OR email = $1) 
        AND is_deleted = FALSE`, [ username.trim().toLowerCase() ])
    if (!userExists) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid login credentials'
        })
    }

    const userPassword = await db.oneOrNone('SELECT id, user_id, password FROM blog_users WHERE user_id = $1', [ userExists.user_id ])
    const validPassword = bcrypt.compareSync(password, userPassword.password);
    if (!validPassword) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid login credentials'
        })
    }

    const allowedStatuses = [ 'active', 'inactive' ]
    if (!allowedStatuses.includes(userExists.status)) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: `User account is ${userExists.status}, kindly contact support team`
        })
    }

    // generate jwt token to manage sessions
    const token = jwt.sign({ user_id: userExists.user_id, email: userExists.email }, process.env.JWT_SECRET, { expiresIn: '10mins' })
    await db.none('UPDATE blog_users SET updated_at = NOW(), last_login_at = NOW() WHERE user_id = $1', [ userExists.user_id ]);

    return res.status(200).json({
        status: 'success',
         code: 200,
         message: 'User logged in successfully',
         data: { ...userExists, token }
    })
})

app.get('/posts', async(req, res) => {
  const posts = await db.any(`SELECT * FROM blog_posts WHERE is_published = $1 AND status = $2`, [ true, 'published' ]);
  return res.status(200).json({
    status: 'success',
    message: 'Blog posts retrieved successfully',
    data: posts
  });
});

async function decodeToken (req, res) {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: 'Please provide a token'
            })
        }

        if (!token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid token sent'
        })
        }

        if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const blogUser = await db.oneOrNone('SELECT id, user_id, email, user_name, first_name, last_name, is_verified_account, status, created_at FROM blog_users WHERE user_id = $1 AND is_deleted = FALSE', [ decodedToken.user_id ]);
        if (!blogUser) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: 'Invalid token'
            })
        }
        const errorMessage = blogUser.status === 'inactive' ? 'User account is inactive, kindly verify your account in your email, or request another verification' :
            `User account is ${blogUser.status}, kindly contact support team`;

        if (blogUser && blogUser.status !== 'active') {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: errorMessage
            })
        }
        return blogUser;
    } catch (error) {
        if (error.message) {
            if (error.message.trim().toLowerCase() === 'jwt expired') {
                return res.status(401).json({
                    status: 'error',
                    code: 401,
                    message: 'Session timeout'
                })
            }
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: error.message
            })
        }
    }
}

app.post('/posts/:postId/comment', async(req, res) => {
    try {
        const { body: { comment }, params: { postId } } = req;

        // decode the token
        const blogUser = await decodeToken(req, res);

        if (!comment) {
            return res.status(422).json({
                status: 'error',
                code: 422,
                message: 'comment is required'
            })
        }

        const postExists = await db.oneOrNone(`SELECT id, title, content FROM blog_posts WHERE id = $1 AND status = 'published'`, [ postId ]);
        if (!postExists) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'Post does not exist'
            })
        }

        const postComment = await db.one(`
            INSERT INTO blog_post_comments 
                (post_id, user_id, comment) 
            VALUES ($1, $2, $3) RETURNING id, post_id, comment, views_count, likes_count, is_deleted, created_at
            `, [ postExists.id, blogUser.user_id, comment.trim() ]);
        
        return res.status(201).json({
            status: 'success',
            code: 201,
            message: 'Comment posted successfully',
            data: postComment
        })
    } catch(err) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: err.message
        })
    }
})

app.post('/posts/:postId', async(req, res) => {
    try {
    const { params: { postId }, query: { action } } = req;

    // decode the token
    const blogUser = await decodeToken(req, res);

    if (!action || (action !== 'like' || action !== 'unlike')) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'action query parameter is required and must be either like or unlike'
        })
    }

    const postExists = await db.oneOrNone(`SELECT id, title, content FROM blog_posts WHERE id = $1 AND status = 'published'`, [ postId ]);
        if (!postExists) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'Post does not exist'
            })
        }
    
        if (action === 'like') {
            const postLike = await db.one('UPDATE blog_posts SET updated_at = NOW(), likes_count = likes_count + 1 WHERE id = $1 RETURNING id, title, content, status, likes_count, views_count', [ postId ])
            return res.status(200).json({
                    status: 'success',
                    code: 200,
                    message: 'Post liked successfully',
                    data: postLike
            })

        } else {
            const postUnlike = await db.one('UPDATE blog_posts SET updated_at = NOW(), likes_count = likes_count - 1 WHERE id = $1 RETURNING id, title, content, status, likes_count, views_count', [ postId ])
            return res.status(200).json({
                    status: 'success',
                    code: 200,
                    message: 'Post unliked successfully',
                    data: postUnlike
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
})

// forgot password endpoint

// reset password endpoint

// dbmigrate



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