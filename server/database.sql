CREATE DATABASE jwttutorial;

--download extention (uuid-ossp)
CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

--insert data
INSERT INTO users (user_name, user_email, user_password) VALUES
('huy', 'huytqse06084@fpt.edu.vn', '1234567');