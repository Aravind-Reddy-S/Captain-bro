-- ====================================================================
-- Supabase Database Schema Initialization for CaptainBro
-- Copy and run this script in the Supabase SQL Editor
-- ====================================================================

-- ── 1. CLEANUP (OPTIONAL) ───────────────────────────────────────────
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS riders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── 2. TABLES CREATION ───────────────────────────────────────────────

-- Users Table
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255)
);

-- Products Table
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    weight VARCHAR(100),
    description TEXT,
    image VARCHAR(255),
    in_stock BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 5.0
);

-- Addresses Table
CREATE TABLE addresses (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address_line TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- Riders Table
CREATE TABLE riders (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'idle',
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    driving_license VARCHAR(100),
    aadhar_number VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_charge NUMERIC(10, 2) DEFAULT 20.00,
    packaging_charge NUMERIC(10, 2) DEFAULT 10.00,
    rider_id VARCHAR(255) REFERENCES riders(id) ON DELETE SET NULL,
    delivery_pin VARCHAR(4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. SEED CATEGORIES DATA ──────────────────────────────────────────
INSERT INTO categories (id, name, image) VALUES
('chicken', 'Fresh Chicken', 'chicken-category.png'),
('mutton', 'Premium Mutton', 'mutton-category.png'),
('fish', 'Fresh Fishes', 'fish-category.png'),
('prawns', 'Fresh Prawns', 'prawns-category.png'),
('vegetables', 'Fresh Vegetables', 'onions.png'),
('fruits', 'Fresh Fruits', 'fruits-category.png'),
('grocery', 'Daily Grocery', 'cooking-oil.png');

-- ── 4. SEED PRODUCTS DATA ────────────────────────────────────────────
INSERT INTO products (id, name, category, price, weight, description, image, in_stock, rating) VALUES
('p1', 'Tender Chicken Curry Cut', 'chicken', 240.00, '500g', 'Fresh, skinless, bone-in chicken curry cut sourced directly from local farms. Sized perfectly for authentic curries.', 'chicken-curry.png', TRUE, 4.8),
('p2', 'Premium Goat Mutton (Bone-in)', 'mutton', 450.00, '500g', 'Juicy and tender cuts of fresh goat meat, perfect for slow cooking, mutton biryani, and rich masalas.', 'mutton-curry.png', TRUE, 4.9),
('p3', 'Fresh Koramanu (Murrel Fish)', 'fish', 380.00, '500g', 'Highly sought-after local black murrel fish, cleaned, scaled, and sliced. Ready for frying or traditional tamarind curry.', 'koramanu-fish.png', TRUE, 4.7),
('p4', 'Jumbo River Prawns', 'prawns', 490.00, '500g', 'Indulgent, shell-off, de-veined jumbo prawns packed fresh with zero preservatives.', 'prawns.png', TRUE, 4.6),
('p5', 'Organic Farm Onions', 'vegetables', 35.00, '1kg', 'Crisp, flavorful farm-grown red onions. Handpicked and stored hygienically.', 'onions.png', TRUE, 4.7),
('p6', 'Fresh Green Chillies', 'vegetables', 15.00, '250g', 'Spicy and sharp green chillies sourced directly from local organic farms in Warangal.', 'green-chillies.png', TRUE, 4.6),
('p7', 'Fresh Coriander Bunch', 'vegetables', 10.00, '1 bunch', 'Aromatic and fresh green coriander leaves, harvested daily.', 'coriander.png', TRUE, 4.9),
('p8', 'Organic Lemon Pack', 'vegetables', 20.00, '4 pcs', 'Juicy, farm-fresh yellow lemons loaded with Vitamin C.', 'lemon.png', TRUE, 4.8),
('p9', 'Premium Basmati Rice', 'grocery', 120.00, '1kg', 'Long-grain, aromatic aged basmati rice, perfect for biryani and pulao.', 'basmati-rice.png', TRUE, 4.9),
('p10', 'Pure Sunflower Cooking Oil', 'grocery', 145.00, '1L', 'Healthy, low-absorbent refined sunflower oil for daily culinary needs.', 'cooking-oil.png', TRUE, 4.7),
('p11', 'Fresh Thick Curd Cup', 'grocery', 30.00, '500g', 'Thick, creamy, pasteurized curd made from high-quality milk.', 'curd.png', TRUE, 4.8),
('p12', 'Guntur Red Chilli Powder', 'grocery', 60.00, '250g', 'Authentic, bright red, hot chilli powder milled from selected Guntur chillies.', 'chilli-powder.png', TRUE, 4.9),
('p13', 'Fresh Ginger Garlic Paste', 'grocery', 45.00, '200g', 'Rich, aromatic paste made from fresh premium quality ginger and garlic.', 'ginger-garlic-paste.png', TRUE, 4.8),
('p14', 'Fresh Mint Leaves Bunch', 'vegetables', 12.00, '1 bunch', 'Refreshing and aromatic organically grown mint leaves, harvested fresh daily.', 'mint.png', TRUE, 4.8),
('p15', 'Warangal Special Masala', 'grocery', 80.00, '200g', 'A custom premium spice blend crafted for traditional local mutton and chicken dishes.', 'masala-powder.png', TRUE, 4.9),
('p16', 'Whole Raw Masala Mix', 'grocery', 50.00, '100g', 'Handpicked whole spices including cardamom, cinnamon, cloves, and bay leaves.', 'raw-masala-mix.png', TRUE, 4.7),
('p17', 'Jai Sri Ram Sona Masuri Rice', 'grocery', 70.00, '1kg', 'Premium lightweight and aromatic Sona Masuri rice, a staple for local meals.', 'jai-sri-ram-rice.png', TRUE, 4.8),
('p18', 'Fresh Chicken Boneless', 'chicken', 320.00, '500g', 'Tender, skinless, boneless chicken breast cuts, perfect for grilling, frying, and stir-fries.', 'chicken-boneless.png', TRUE, 4.9),
('p19', 'Juicy Chicken Drumsticks', 'chicken', 260.00, '500g', 'Fresh chicken drumsticks, cleaned and trimmed. Ideal for tandoori and baking.', 'chicken-drumstick.png', TRUE, 4.8),
('p21', 'Mutton Boneless Cuts', 'mutton', 580.00, '500g', 'Fat-free, boneless chunks of tender goat meat, cut to perfection for dry fry or mutton tikka.', 'mutton-boneless.png', TRUE, 4.9),
('p22', 'Rava Fish Fry Cut', 'fish', 290.00, '500g', 'Cleaned, sliced fish pieces seasoned and ready for traditional rava fish fry.', 'rava-fish.png', TRUE, 4.6),
('p23', 'Organic Sweet Bananas', 'fruits', 60.00, '1 dozen', 'Perfectly ripe, sweet organic bananas sourced from local farmers in Telangana.', 'banana.png', TRUE, 4.8),
('p24', 'Fresh Red Apple', 'fruits', 150.00, '1kg', 'Fresh, juicy and crisp red apples imported from premium orchards.', 'apple.png', TRUE, 4.8),
('p26', 'Organic Papaya', 'fruits', 50.00, '1 pc (800g)', 'Sweet and nutritious farm-fresh organic papaya.', 'papaya.png', TRUE, 4.7),
('p27', 'Fresh Pomegranate', 'fruits', 160.00, '1kg', 'Premium ruby-red pomegranates packed with antioxidants.', 'pomegranate.png', TRUE, 4.8),
('p28', 'Fresh Seedless Grapes', 'fruits', 90.00, '500g', 'Crisp, sweet, and seedless green and purple grapes.', 'grapes.png', TRUE, 4.6),
('p29', 'Sweet Paan', 'grocery', 25.00, '1 pc', 'Traditional sweet paan filled with gulkand, cherries, and sweet spices for a perfect dessert digestive.', 'sweet-paan.png', TRUE, 4.9),
('p30', 'Gulab Jamun', 'grocery', 50.00, '2 pcs', 'Soft, delicious, rose-syrup soaked sweet milk dumplings.', 'gulab-jamun.png', TRUE, 4.9),
('p31', 'Sprite (750ml)', 'grocery', 45.00, '750ml', 'Ice-cold refreshing lemon-lime carbonated beverage.', 'sprite.png', TRUE, 4.8),
('p32', 'Thums Up (750ml)', 'grocery', 45.00, '750ml', 'Strong carbonated cola drink with a spicy bite.', 'thums-up.png', TRUE, 4.8),
('p33', 'Vanilla Ice Cream', 'grocery', 60.00, '250g', 'Classic rich and creamy vanilla bean ice cream.', 'vanilla-ice-cream.png', TRUE, 4.8),
('p34', 'Double Ka Meetha', 'grocery', 80.00, '200g', 'Delectable bread pudding sweet soaked in cardamom syrup and garnished with dry fruits.', 'double-ka-meetha.png', TRUE, 4.9),
('p35', 'Thick Curd', 'grocery', 30.00, '500g', 'Thick, creamy and pasteurized fresh dairy curd.', 'thick-curd.png', TRUE, 4.8),
('p39', 'Fresh Chicken Skin', 'chicken', 120.00, '500g', 'Freshly prepared and cleaned chicken skin, rich in flavor. Perfect for making crispy chicken skin snacks, cracklings, or rendering schmaltz.', 'chicken-skin.png', TRUE, 4.8);

-- Enable Row Level Security (RLS) or add indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
