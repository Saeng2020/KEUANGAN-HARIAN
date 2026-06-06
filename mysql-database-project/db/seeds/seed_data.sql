INSERT INTO users (id, name, email, created_at) VALUES
(1, 'John Doe', 'john.doe@example.com', NOW()),
(2, 'Jane Smith', 'jane.smith@example.com', NOW()),
(3, 'Alice Johnson', 'alice.johnson@example.com', NOW());

INSERT INTO products (id, name, description, price, created_at) VALUES
(1, 'Product A', 'Description for Product A', 29.99, NOW()),
(2, 'Product B', 'Description for Product B', 49.99, NOW()),
(3, 'Product C', 'Description for Product C', 19.99, NOW());

INSERT INTO orders (id, user_id, product_id, quantity, order_date) VALUES
(1, 1, 1, 2, NOW()),
(2, 2, 2, 1, NOW()),
(3, 1, 3, 5, NOW());