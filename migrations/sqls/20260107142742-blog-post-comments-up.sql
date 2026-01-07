CREATE TABLE IF NOT EXISTS blog_post_comments (
	id SERIAL PRIMARY KEY,
	post_id INT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES blog_users(user_id) ON DELETE CASCADE,
	comment TEXT NOT NULL,
	views_count INT DEFAULT 0,
	likes_count INT DEFAULT 0,
	is_deleted BOOLEAN DEFAULT false,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_at TIMESTAMPTZ 
);

INSERT INTO authors (name, email, image_url, bio)
VALUES 
	('Blog Admin', 'blogadmin@gmail.com', 'https://images.dojah.io/selfie_sample_image_1720624219.jpg', 'Blog admin author profile');
