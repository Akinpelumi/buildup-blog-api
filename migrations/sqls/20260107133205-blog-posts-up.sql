CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'unpublished', 'archived');
CREATE TYPE blog_user_status AS ENUM ('active', 'inactive', 'suspended', 'deactivated');

CREATE TABLE IF NOT EXISTS categories (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	is_deleted BOOLEAN DEFAULT false,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_at TIMESTAMPTZ
);

INSERT INTO categories (name) 
VALUES 
	('general'), 
	('scifi'), 
	('entertainment'), 
	('politics'),
	('fashion'),
	('fitness'),
    ('food'), 
	('finance'),
	('religion');

CREATE TABLE IF NOT EXISTS authors (
	id SERIAL,
	author_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL,
	email VARCHAR(50) NOT NULL,
	image_url TEXT,
	bio TEXT,
	blog_posts INT DEFAULT 0,
	is_deleted BOOLEAN DEFAULT false,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_at TIMESTAMPTZ 
);

CREATE TABLE IF NOT EXISTS blog_posts (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	content TEXT NOT NULL,
	category INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,  
	author UUID NOT NULL REFERENCES authors(author_id) ON DELETE CASCADE ON UPDATE CASCADE,
	is_published BOOLEAN DEFAULT false,
	status blog_post_status NOT NULL,
	tags TEXT[],
	images TEXT[],
	views_count INT DEFAULT 0,
	likes_count INT DEFAULT 0,
	is_deleted BOOLEAN DEFAULT false,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS blog_users (
	id SERIAL,
	user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_name VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50),
	email VARCHAR(50) UNIQUE NOT NULL,
	password TEXT,
	status blog_user_status DEFAULT 'inactive',
	is_verified_account BOOLEAN DEFAULT FALSE,
	verification_code VARCHAR,
	verification_code_expire_at TIMESTAMPTZ,
	is_deleted BOOLEAN DEFAULT FALSE,
	last_login_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_at TIMESTAMPTZ
);
