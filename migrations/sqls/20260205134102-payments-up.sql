CREATE TYPE payment_status AS ENUM ('pending', 'success', 'fail', 'abandoned');
CREATE TYPE payment_type AS ENUM ('subscription', 'one-time');
CREATE TYPE subscription_frequency AS ENUM ('daily', 'monthly', 'yearly');

CREATE TABLE IF NOT EXISTS payment_histories (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES blog_users(user_id) ON DELETE CASCADE,
    amount NUMERIC(19, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(150),
    transaction_reference VARCHAR(200) NOT NULL,
    payment_gateway VARCHAR(200) NOT NULL DEFAULT 'paystack',
    transaction_id VARCHAR,
    payment_type payment_type NOT NULL,
    post_id INT REFERENCES blog_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(19, 2) NOT NULL,
    frequency subscription_frequency NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, description, price, frequency, is_active) VALUES
('Gold', 'Access to premium content for a month', 10.00, 'monthly', true),
('Gold', 'Access to premium content for a year', 100.00, 'yearly', true),
('Diamond', 'Access to premium plus content for a month', 20.00, 'monthly', true),
('Diamond', 'Access to premium plus content for a year', 200.00, 'yearly', true),
('One Time', 'Access to premium content for a day', 20.00, 'daily', true);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES blog_users(user_id) ON DELETE CASCADE,
    payment_id INT NOT NULL REFERENCES payment_histories(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    payment_type payment_type NOT NULL,
    post_id INT REFERENCES blog_posts(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_histories (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES blog_users(user_id) ON DELETE CASCADE,
    amount NUMERIC(19, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    transaction_reference VARCHAR(200) NOT NULL,
    payment_gateway VARCHAR(200) NOT NULL DEFAULT 'paystack',
    transaction_id VARCHAR,
    payment_type payment_type NOT NULL,
    post_id INT REFERENCES blog_posts(id) ON DELETE CASCADE,
    plan_id INT REFERENCES subscription_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);