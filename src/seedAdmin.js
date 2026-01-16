import bcrypt from 'bcryptjs';
import db from './config/db/index.js';

const seedAdmin = async () => {
    try {
        const email = process.env.SEED_ADMIN_EMAIL;
        const password = process.env.SEED_ADMIN_PASSWORD;
        const userName = process.env.SEED_ADMIN_USER_NAME;
        const firstName = process.env.SEED_ADMIN_FIRST_NAME || 'Admin';
        const lastName = process.env.SEED_ADMIN_LAST_NAME || 'User';

        const existingAdmin = await db.oneOrNone('SELECT id, email, user_name FROM blog_users WHERE email = $1 OR user_name = $2', [email.trim().toLowerCase(), userName.trim().toLowerCase()]);

        if (existingAdmin) {
            console.log('Admin user already exists with either the email or username provided.');
            process.exit(0); 
        }

        // hash password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            
        // Create admin user
        await db.none(`INSERT INTO blog_users (email, user_name, password, first_name, last_name, status, is_verified_account, user_type) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
            [email.trim().toLowerCase(), userName.trim().toLowerCase(), hash, firstName, lastName, 'active', true, 'admin']);

        console.log(`Successfully Seeded admin with email ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
}

seedAdmin();
