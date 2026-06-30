/**
 * Firestore Seed Script (firebase-admin v13+ modular API)
 * Seeds initial products, categories, and admin user into the Firestore database.
 * 
 * Usage: node seed-firestore.cjs
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with default credentials
initializeApp({
  projectId: 'food-delivery-app-a3z03b'
});

const db = getFirestore();

const CATEGORIES = [
  { id: 'chicken', name: 'Fresh Chicken', image: 'chicken-category.png' },
  { id: 'mutton', name: 'Premium Mutton', image: 'mutton-category.png' },
  { id: 'fish', name: 'Fresh Fishes', image: 'fish-category.png' },
  { id: 'prawns', name: 'Fresh Prawns', image: 'prawns-category.png' },
  { id: 'vegetables', name: 'Fresh Vegetables', image: 'onions.png' },
  { id: 'fruits', name: 'Fresh Fruits', image: 'fruits-category.png' },
  { id: 'grocery', name: 'Daily Grocery', image: 'cooking-oil.png' },
  { id: 'pickles', name: 'Homemade Pickles', image: 'pickles-category.png' }
];

const PRODUCTS = [
  { id: 'p1', name: 'Tender Chicken Curry Cut', category: 'chicken', price: 240, weight: '500g', description: 'Fresh, skinless, bone-in chicken curry cut sourced directly from local farms.', image: 'chicken-curry.png', inStock: true, rating: 4.8 },
  { id: 'p2', name: 'Premium Goat Mutton (Bone-in)', category: 'mutton', price: 450, weight: '500g', description: 'Juicy and tender cuts of fresh goat meat, perfect for slow cooking.', image: 'mutton-curry.png', inStock: true, rating: 4.9 },
  { id: 'p3', name: 'Fresh Koramanu (Murrel Fish)', category: 'fish', price: 380, weight: '500g', description: 'Local black murrel fish, cleaned, scaled, and sliced.', image: 'koramanu-fish.png', inStock: true, rating: 4.7 },
  { id: 'p4', name: 'Jumbo River Prawns', category: 'prawns', price: 490, weight: '500g', description: 'Shell-off, de-veined jumbo prawns packed fresh.', image: 'prawns.png', inStock: true, rating: 4.6 },
  { id: 'p5', name: 'Organic Farm Onions', category: 'vegetables', price: 35, weight: '1kg', description: 'Crisp, flavorful farm-grown red onions.', image: 'onions.png', inStock: true, rating: 4.7 },
  { id: 'p6', name: 'Fresh Green Chillies', category: 'vegetables', price: 15, weight: '250g', description: 'Spicy green chillies from local organic farms.', image: 'green-chillies.png', inStock: true, rating: 4.6 },
  { id: 'p7', name: 'Fresh Coriander Bunch', category: 'vegetables', price: 10, weight: '1 bunch', description: 'Aromatic fresh green coriander leaves.', image: 'coriander.png', inStock: true, rating: 4.9 },
  { id: 'p8', name: 'Organic Lemon Pack', category: 'vegetables', price: 20, weight: '4 pcs', description: 'Juicy farm-fresh yellow lemons.', image: 'lemon.png', inStock: true, rating: 4.8 },
  { id: 'p9', name: 'Premium Basmati Rice', category: 'grocery', price: 120, weight: '1kg', description: 'Long-grain aged basmati rice for biryani and pulao.', image: 'basmati-rice.png', inStock: true, rating: 4.9 },
  { id: 'p10', name: 'Pure Sunflower Cooking Oil', category: 'grocery', price: 145, weight: '1L', description: 'Healthy refined sunflower oil.', image: 'cooking-oil.png', inStock: true, rating: 4.7 },
  { id: 'p11', name: 'Fresh Thick Curd Cup', category: 'grocery', price: 30, weight: '500g', description: 'Thick creamy curd from high-quality milk.', image: 'curd.png', inStock: true, rating: 4.8 },
  { id: 'p12', name: 'Guntur Red Chilli Powder', category: 'grocery', price: 60, weight: '250g', description: 'Hot chilli powder from Guntur chillies.', image: 'chilli-powder.png', inStock: true, rating: 4.9 },
  { id: 'p13', name: 'Fresh Ginger Garlic Paste', category: 'grocery', price: 45, weight: '200g', description: 'Rich paste from fresh ginger and garlic.', image: 'ginger-garlic-paste.png', inStock: true, rating: 4.8 },
  { id: 'p14', name: 'Fresh Mint Leaves Bunch', category: 'vegetables', price: 12, weight: '1 bunch', description: 'Organically grown mint leaves.', image: 'mint.png', inStock: true, rating: 4.8 },
  { id: 'p15', name: 'Warangal Special Masala', category: 'grocery', price: 80, weight: '200g', description: 'Premium spice blend for local dishes.', image: 'masala-powder.png', inStock: true, rating: 4.9 },
  { id: 'p16', name: 'Whole Raw Masala Mix', category: 'grocery', price: 50, weight: '100g', description: 'Whole spices: cardamom, cinnamon, cloves.', image: 'raw-masala-mix.png', inStock: true, rating: 4.7 },
  { id: 'p17', name: 'Jai Sri Ram Sona Masuri Rice', category: 'grocery', price: 70, weight: '1kg', description: 'Aromatic Sona Masuri rice.', image: 'jai-sri-ram-rice.png', inStock: true, rating: 4.8 },
  { id: 'p18', name: 'Fresh Chicken Boneless', category: 'chicken', price: 320, weight: '500g', description: 'Skinless boneless chicken breast cuts.', image: 'chicken-boneless.png', inStock: true, rating: 4.9 },
  { id: 'p19', name: 'Juicy Chicken Drumsticks', category: 'chicken', price: 260, weight: '500g', description: 'Cleaned and trimmed chicken drumsticks.', image: 'chicken-drumstick.png', inStock: true, rating: 4.8 },
  { id: 'p21', name: 'Mutton Boneless Cuts', category: 'mutton', price: 580, weight: '500g', description: 'Boneless tender goat meat chunks.', image: 'mutton-boneless.png', inStock: true, rating: 4.9 },
  { id: 'p22', name: 'Rava Fish Fry Cut', category: 'fish', price: 290, weight: '500g', description: 'Sliced fish for traditional rava fish fry.', image: 'rava-fish.png', inStock: true, rating: 4.6 },
  { id: 'p23', name: 'Organic Sweet Bananas', category: 'fruits', price: 60, weight: '1 dozen', description: 'Sweet organic bananas from Telangana.', image: 'banana.png', inStock: true, rating: 4.8 },
  { id: 'p24', name: 'Fresh Red Apple', category: 'fruits', price: 150, weight: '1kg', description: 'Juicy red apples from premium orchards.', image: 'apple.png', inStock: true, rating: 4.8 },
  { id: 'p26', name: 'Organic Papaya', category: 'fruits', price: 50, weight: '1 pc (800g)', description: 'Farm-fresh organic papaya.', image: 'papaya.png', inStock: true, rating: 4.7 },
  { id: 'p27', name: 'Fresh Pomegranate', category: 'fruits', price: 160, weight: '1kg', description: 'Ruby-red pomegranates packed with antioxidants.', image: 'pomegranate.png', inStock: true, rating: 4.8 },
  { id: 'p28', name: 'Fresh Seedless Grapes', category: 'fruits', price: 90, weight: '500g', description: 'Crisp seedless green and purple grapes.', image: 'grapes.png', inStock: true, rating: 4.6 },
  { id: 'p29', name: 'Sweet Paan', category: 'grocery', price: 25, weight: '1 pc', description: 'Traditional sweet paan with gulkand.', image: 'sweet-paan.png', inStock: true, rating: 4.9 },
  { id: 'p30', name: 'Gulab Jamun', category: 'grocery', price: 50, weight: '2 pcs', description: 'Rose-syrup soaked sweet milk dumplings.', image: 'gulab-jamun.png', inStock: true, rating: 4.9 },
  { id: 'p31', name: 'Sprite (750ml)', category: 'grocery', price: 45, weight: '750ml', description: 'Refreshing lemon-lime carbonated beverage.', image: 'sprite.png', inStock: true, rating: 4.8 },
  { id: 'p32', name: 'Thums Up (750ml)', category: 'grocery', price: 45, weight: '750ml', description: 'Strong carbonated cola drink.', image: 'thums-up.png', inStock: true, rating: 4.8 },
  { id: 'p33', name: 'Vanilla Ice Cream', category: 'grocery', price: 60, weight: '250g', description: 'Rich and creamy vanilla bean ice cream.', image: 'vanilla-ice-cream.png', inStock: true, rating: 4.8 },
  { id: 'p34', name: 'Double Ka Meetha', category: 'grocery', price: 80, weight: '200g', description: 'Bread pudding soaked in cardamom syrup.', image: 'double-ka-meetha.png', inStock: true, rating: 4.9 },
  { id: 'p35', name: 'Thick Curd', category: 'grocery', price: 30, weight: '500g', description: 'Thick creamy fresh dairy curd.', image: 'thick-curd.png', inStock: true, rating: 4.8 },
  { id: 'p36', name: 'Traditional Mango Pickle (Avakaya)', category: 'pickles', price: 180, weight: '250g', description: 'Homemade spicy mango pickle.', image: 'mango-pickle.png', inStock: true, rating: 4.8 },
  { id: 'p37', name: 'Spicy Tomato Pickle', category: 'pickles', price: 120, weight: '250g', description: 'Tangy homemade tomato pickle.', image: 'tomato-pickle.png', inStock: true, rating: 4.7 },
  { id: 'p38', name: 'Special Chicken Pickle', category: 'pickles', price: 290, weight: '250g', description: 'Homemade boneless chicken pickle.', image: 'chicken-pickle.png', inStock: true, rating: 4.9 },
  { id: 'p39', name: 'Fresh Chicken Skin', category: 'chicken', price: 120, weight: '500g', description: 'Cleaned chicken skin for crispy snacks.', image: 'chicken-skin.png', inStock: true, rating: 4.8 }
];

async function seed() {
  console.log('Starting Firestore seed...\n');

  // 1. Seed Categories
  console.log('Seeding categories...');
  const categoriesBatch = db.batch();
  for (const cat of CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    categoriesBatch.set(ref, cat);
  }
  await categoriesBatch.commit();
  console.log(`  Done: ${CATEGORIES.length} categories seeded.\n`);

  // 2. Seed Products
  console.log('Seeding products...');
  const productsBatch = db.batch();
  for (const prod of PRODUCTS) {
    const ref = db.collection('products').doc(prod.id);
    productsBatch.set(ref, { ...prod, createdAt: new Date().toISOString() });
  }
  await productsBatch.commit();
  console.log(`  Done: ${PRODUCTS.length} products seeded.\n`);

  // 3. Create admin user profile in Firestore
  console.log('Creating admin user profile in Firestore...');
  const adminUid = 'admin_seed_001';
  await db.collection('users').doc(adminUid).set({
    uid: adminUid,
    email: 'admin@wfoods.com',
    fullName: 'System Admin',
    phone: '9876543210',
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  console.log('  Done: Admin user profile created.\n');

  console.log('Firestore seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
