export default {
    checkUserExistsByEmail: 'SELECT id, email, user_name FROM blog_users WHERE email = $1',
    checkUserExistsByUsername: 'SELECT id, email, user_name FROM blog_users WHERE user_name = $1',
    createUser: `
        INSERT INTO blog_users (email, user_name, password, first_name, last_name, verification_code, verification_code_expire_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email, user_name, first_name, last_name, verification_code_expire_at, created_at`,
    checkIfUserActivelyExistsByEmail: 'SELECT id, user_id, email, first_name, last_name, is_verified_account, verification_code, verification_code_expire_at FROM blog_users WHERE email = $1 AND is_deleted = FALSE',
    updateUserAccountVerification: `
        UPDATE blog_users
          SET updated_at = NOW(),
          is_verified_account = TRUE,
          status = 'active',
          verification_code = NULL,
          verification_code_expire_at = NULL
        WHERE email = $1
        RETURNING id, user_id, email, first_name, last_name, is_verified_account, status, created_at, updated_at`,
    updateUserVerificationCode: 'UPDATE blog_users SET updated_at = NOW(), verification_code = $2, verification_code_expire_at = $3 WHERE email = $1 RETURNING id, user_id, email, verification_code, verification_code_expire_at',
    checkIfUserActivelyExistsByEmailAndUsername: `
        SELECT id, user_id, email, user_name, first_name, last_name, is_verified_account, status, created_at 
        FROM blog_users 
        WHERE (user_name = $1 OR email = $1) 
        AND is_deleted = FALSE`,
    checkIfUserActivelyExistsByUserId: 'SELECT id, user_id, email, user_name, first_name, last_name, is_verified_account, status, created_at FROM blog_users WHERE user_id = $1 AND is_deleted = FALSE',
    userPassword: 'SELECT id, user_id, password FROM blog_users WHERE user_id = $1',
    updateUserOnLogin: 'UPDATE blog_users SET updated_at = NOW(), last_login_at = NOW() WHERE user_id = $1',
    deleteUnusedOtps: `
        UPDATE blog_users 
        SET 
            updated_at = NOW(), 
            verification_code = NULL, 
            verification_code_expire_at = NULL 
        WHERE verification_code_expire_at < NOW()`,
    newlySignedUpBlogUsers: `
        SELECT id, user_id, email, user_name, first_name, last_name, created_at 
        FROM blog_users 
        WHERE created_at >= NOW() - INTERVAL '1 day' 
        AND is_deleted = FALSE`
}