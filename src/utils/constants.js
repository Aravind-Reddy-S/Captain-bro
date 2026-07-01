export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  RIDER: 'rider'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const CATEGORIES = [
  { id: 'our-products', name: "Our\nProducts", image: 'fooditems.png' },
  { id: 'fruits', name: "Fresh\nFruits", image: 'fruits-category.png' },
  { id: 'vegetables', name: "Fresh\nVegetables", image: 'onions.png' },
  { id: 'chicken', name: 'Fresh Chicken', image: 'chicken-category.png' },
  { id: 'mutton', name: 'Premium Mutton', image: 'mutton-category.png' },
  { id: 'fish', name: "Fresh\nFishes", image: 'fish-category.png' },
  { id: 'prawns', name: 'Fresh Prawns', image: 'prawns-category.png' },
  { id: 'pickles', name: "Homemade\nPickles", image: 'pickles-category.png' },
  { id: 'grocery', name: 'Daily Grocery', image: 'cooking-oil.png' }
];

export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Tender Chicken Curry Cut',
    category: 'chicken',
    price: 160,
    weight: '500g',
    description: 'Fresh, skinless, bone-in chicken curry cut sourced directly from local farms. Sized perfectly for authentic curries.',
    image: 'chicken-curry.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p2',
    name: 'Premium Goat Mutton ',
    category: 'mutton',
    price: 420,
    weight: '500g',
    description: 'Juicy and tender cuts of fresh goat meat, perfect for slow cooking, mutton biryani, and rich masalas.',
    image: 'mutton-curry.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p3',
    name: 'Fresh Koramanu (Murrel Fish)',
    category: 'fish',
    price: 380,
    weight: '1000g',
    description: 'Highly sought-after local black murrel fish, cleaned, scaled, and sliced. Ready for frying or traditional tamarind curry.',
    image: 'koramanu-fish.png',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'p4',
    name: ' Prawns',
    category: 'prawns',
    price: 200,
    weight: '500g',
    description: 'Indulgent, shell-off, de-veined jumbo prawns packed fresh with zero preservatives.',
    image: 'prawns.png',
    inStock: true,
    rating: 4.6
  },
  {
    id: 'p5',
    name: ' Onions',
    category: 'vegetables',
    price: 25,
    weight: '1kg',
    description: 'Crisp, flavorful farm-grown red onions. Handpicked and stored hygienically.',
    image: 'onions.png',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'p6',
    name: 'Fresh Green Chillies',
    category: 'vegetables',
    price: 15,
    weight: '250g',
    description: 'Spicy and sharp green chillies sourced directly from local organic farms in Warangal.',
    image: 'green-chillies.png',
    inStock: true,
    rating: 4.6
  },
  {
    id: 'p7',
    name: 'Fresh Coriander Bunch',
    category: 'vegetables',
    price: 9,
    weight: '1 bunch',
    description: 'Aromatic and fresh green coriander leaves, harvested daily.',
    image: 'coriander.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p8',
    name: 'Lemon Pack',
    category: 'vegetables',
    price: 15,
    weight: '4 pcs',
    description: 'Juicy, farm-fresh yellow lemons loaded with Vitamin C.',
    image: 'lemon.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p9',
    name: 'Premium Basmati Rice',
    category: 'grocery',
    price: 65,
    weight: '1kg',
    description: 'Long-grain, aromatic aged basmati rice, perfect for biryani and pulao.',
    image: 'basmati-rice.png',
    inStock: true,
    rating: 4.9
  },

  {
    id: 'p11',
    name: 'Fresh Curd ',
    category: 'grocery',
    price: 30,
    weight: '500g',
    description: 'Thick, creamy, pasteurized curd made from high-quality milk.',
    image: 'curd.png',
    inStock: true,
    rating: 4.8
  },

  {
    id: 'p13',
    name: 'Fresh Ginger Garlic Paste',
    category: 'grocery',
    price: 30,
    weight: '100g',
    description: 'Rich, aromatic paste made from fresh premium quality ginger and garlic.',
    image: 'ginger-garlic-paste.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p14',
    name: 'Fresh Mint Leaves Bunch',
    category: 'vegetables',
    price: 9,
    weight: '1 bunch',
    description: 'Refreshing and aromatic organically grown mint leaves, harvested fresh daily.',
    image: 'mint.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p15',
    name: 'Special Masala',
    category: 'grocery',
    price: 45,
    weight: '50g',
    description: 'A custom premium spice blend crafted for traditional local mutton and chicken dishes.',
    image: 'masala-powder.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p16',
    name: 'Whole Raw Masala Mix',
    category: 'grocery',
    price: 50,
    weight: '50g',
    description: 'Handpicked whole spices including cardamom, cinnamon, cloves, and bay leaves.',
    image: 'raw-masala-mix.png',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'p17',
    name: 'Jai Sri Ram Sona Masuri Rice',
    category: 'grocery',
    price: 45,
    weight: '1kg',
    description: 'Premium lightweight and aromatic Sona Masuri rice, a staple for local meals.',
    image: 'jai-sri-ram-rice.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p18',
    name: 'Fresh Chicken Boneless',
    category: 'chicken',
    price: 230,
    weight: '500g',
    description: 'Tender, skinless, boneless chicken breast cuts, perfect for grilling, frying, and stir-fries.',
    image: 'chicken-boneless.png',
    inStock: true,
    rating: 4.9
  },

  {
    id: 'p21',
    name: 'Mutton Boneless Cuts',
    category: 'mutton',
    price: 560,
    weight: '500g',
    description: 'Fat-free, boneless chunks of tender goat meat, cut to perfection for dry fry or mutton tikka.',
    image: 'mutton-boneless.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p22',
    name: 'Rava Fish Fry Cut',
    category: 'fish',
    price: 200,
    weight: '500g',
    description: 'Cleaned, sliced fish pieces seasoned and ready for traditional rava fish fry.',
    image: 'rava-fish.png',
    inStock: true,
    rating: 4.6
  },
  {
    id: 'p23',
    name: ' Bananas',
    category: 'fruits',
    price: 60,
    weight: '1 dozen',
    description: 'Perfectly ripe, sweet  bananas sourced from local farmers in Telangana.',
    image: 'banana.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p24',
    name: 'Fresh Apple',
    category: 'fruits',
    price: 99,
    weight: '1kg',
    description: 'Fresh, juicy and crisp red apples imported from premium orchards.',
    image: 'apple.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p26',
    name: 'Organic Papaya',
    category: 'fruits',
    price: 50,
    weight: '1 pc (800g)',
    description: 'Sweet and nutritious farm-fresh organic papaya.',
    image: 'papaya.png',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'p27',
    name: 'Pomegranate',
    category: 'fruits',
    price: 120,
    weight: '1kg',
    description: 'Premium ruby-red pomegranates packed with antioxidants.',
    image: 'pomegranate.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p28',
    name: 'Grapes',
    category: 'fruits',
    price: 90,
    weight: '500g',
    description: 'Crisp, sweet, and  green and purple grapes.',
    image: 'grapes.png',
    inStock: true,
    rating: 4.6
  },

  {
    id: 'p30',
    name: 'Gulab Jamun',
    category: 'grocery',
    price: 50,
    weight: '2 pcs',
    description: 'Soft, delicious, rose-syrup soaked sweet milk dumplings.',
    image: 'gulab-jamun.png',
    inStock: true,
    rating: 4.9
  },

  {
    id: 'p33',
    name: 'Vanilla Ice Cream',
    category: 'grocery',
    price: 60,
    weight: '250g',
    description: 'Classic rich and creamy vanilla bean ice cream.',
    image: 'vanilla-ice-cream.png',
    inStock: true,
    rating: 4.8
  },

  {
    id: 'p35',
    name: 'Curd',
    category: 'grocery',
    price: 30,
    weight: '500g',
    description: 'Thick, creamy and pasteurized fresh dairy curd.',
    image: 'thick-curd.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p36',
    name: ' Mango Pickle ',
    category: 'pickles',
    price: 180,
    weight: '250g',
    description: 'Authentic homemade spicy mango pickle made with premium cold-pressed sesame oil, Guntur red chillies, and handpicked green mangoes.',
    image: 'mango-pickle.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p37',
    name: 'Tomato Pickle',
    category: 'pickles',
    price: 120,
    weight: '250g',
    description: 'Tangy and fiery homemade tomato pickle cooked to perfection with mustard seeds, garlic, and traditional local spices.',
    image: 'tomato-pickle.png',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'p38',
    name: ' Chicken Pickle',
    category: 'pickles',
    price: 290,
    weight: '250g',
    description: 'Delectable homemade boneless chicken pickle, deep-fried and marinated in a rich, spicy, and tangy masala blend.',
    image: 'chicken-pickle.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p39',
    name: 'Fresh Chicken Skin',
    category: 'chicken',
    price: 150,
    weight: '500g',
    description: 'Freshly prepared and cleaned chicken skin, rich in flavor. Perfect for making crispy chicken skin snacks, cracklings, or rendering schmaltz.',
    image: 'chicken-skin.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p40',
    name: 'Chilli Powder',
    category: 'grocery',
    price: 180,
    weight: '500g',
    description: '100% pure and natural chilli powder made from premium 341 type chillies. Naturally dried with no added preservatives or colors.',
    image: 'captain-bro-chilli-powder.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p41',
    name: 'Turmeric Powder',
    category: 'grocery',
    price: 90,
    weight: '500g',
    description: '100% pure and natural turmeric powder made from premium quality turmeric roots. Naturally dried with no added preservatives or colors.',
    image: 'captain-bro-turmeric-powder.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p42',
    name: 'Dhanaya Powder',
    category: 'grocery',
    price: 125,
    weight: '500g',
    description: '100% pure and natural coriander powder (dhanaya powder) made from premium quality coriander seeds. Naturally dried with no added preservatives or colors.',
    image: 'captain-bro-dhanaya-powder.png',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'p43',
    name: 'Natural Sugar Deshi',
    category: 'grocery',
    price: 70,
    weight: '500g',
    description: '100% organic, unrefined and natural brown deshi sugar sourced from premium sugarcane farms. No chemical processing, rich in minerals, authentic sweet taste.',
    image: 'captain-bro-natural-sugar.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p44',
    name: 'Natural Jaggery (Bellam)',
    category: 'grocery',
    price: 110,
    weight: '500g',
    description: '100% natural and premium quality jaggery (bellam). Processed traditionally with no chemical clarification or artificial additives. Rich in minerals and iron.',
    image: 'captain-bro-natural-jaggery.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p45',
    name: 'Thramic Power',
    category: 'grocery',
    price: 60,
    weight: '100g',
    description: '100% pure and natural premium gravy powder made with cashews, almonds, watermelon seeds, pumpkin seeds, and melon seeds imported from Kerala farmers. No added powder, only premium whole spices. Perfect base for chicken, mutton, or paneer gravies.',
    image: 'captain-bro-general-gravy.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p46',
    name: 'Kerala Natural Masala Powder',
    category: 'grocery',
    price: 60,
    weight: '50g',
    description: '100% pure and natural traditional spice masala powder imported from Kerala farmers. Pure spices, pure taste. Excellent spice mix for chicken, mutton, or paneer gravies.',
    image: 'captain-bro-kerala-masala.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p47',
    name: 'Dry Fruits Mix Milk Shake Powder',
    category: 'grocery',
    price: 125,
    weight: '250g',
    description: 'A premium dry fruits mix milk shake powder made with 100% natural ingredients including almonds, cashews, pistachios, walnuts, dates, figs, and oats. No artificial flavors, preservatives, or added sugar.',
    image: 'captain-bro-milkshake-powder.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p48',
    name: 'Natural Face Pack',
    category: 'grocery',
    price: 180,
    weight: '100g',
    description: 'Our Natural Face Pack for Brightness is a powerful blend of 100% pure herbs and natural ingredients like Multani Mitti, Sandalwood, Turmeric, Neem, Rose Petals, Almonds, and Saffron.',
    image: 'captain-bro-face-pack.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p49',
    name: 'Premium Dry Fruits Mix',
    category: 'grocery',
    price: 150,
    weight: '250g',
    description: 'A premium mix of handpicked dry fruits, nuts, and seeds. Contains almonds, cashews, pistachios, walnuts, raisins, cranberries, dates, tutti frutti, pumpkin seeds, sunflower seeds, and melon seeds.',
    image: 'captain-bro-dryfruits-mix.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p50',
    name: 'Natural Face Pack for Men',
    category: 'grocery',
    price: 160,
    weight: '100g',
    description: 'Our Natural Face Pack for Men is a powerful blend of 100% pure herbs and natural ingredients like Multani Mitti, Sandalwood, Turmeric, Neem, Aloe Vera, Bamboo Charcoal, and Rose Petal.',
    image: 'captain-bro-face-pack-men.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p51',
    name: 'Natural Face Pack for Kids',
    category: 'grocery',
    price: 99,
    weight: '100g',
    description: 'Our Natural Face Pack for Kids is a gentle blend of 100% natural herbs and ingredients specially chosen for kids\' delicate skin. Helps to brighten, nourish and keep skin soft, smooth and healthy.',
    image: 'captain-bro-face-pack-kids.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p52',
    name: 'Protein Shake Powder',
    category: 'grocery',
    price: 222,
    weight: '250g',
    description: 'A premium blend of 100% natural ingredients for strength, energy, and muscle health. Made with pea protein, brown rice protein, natural cocoa, oats, flax seeds, and chia seeds.',
    image: 'captain-bro-protein-shake.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p53',
    name: 'Groundnut Oil (250ml)',
    category: 'grocery',
    price: 85,
    weight: '250ml',
    description: '100% original, groundnut oil extracted naturally from premium peanuts. Naturally rich in nutrients, no added preservatives, zero trans fat.',
    image: 'captain-bro-groundnut-oil-250.jpg',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p54',
    name: 'Groundnut Oil (500ml)',
    category: 'grocery',
    price: 170,
    weight: '500ml',
    description: '100% original, groundnut oil extracted naturally from premium peanuts. Packaged in a premium glass bottle with an easy pourer cap.',
    image: 'captain-bro-groundnut-oil-500.png',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p55',
    name: 'Groundnut Oil (1000ml)',
    category: 'grocery',
    price: 340,
    weight: '1000ml',
    description: '100% original, groundnut oil extracted naturally from premium peanuts. Loaded with natural antioxidants, nutrients, and a high smoke point. No preservatives.',
    image: 'captain-bro-groundnut-oil-1000.jpg',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'p56',
    name: ' Natural Face Pack for Women',
    category: 'grocery',
    price: 166,
    weight: '100g',
    description: 'Our Natural Face Pack for Women is a powerful blend of 100% pure herbs and natural ingredients. It brightens skin naturally, evens skin tone, deeply cleanses, reduces dark spots, and is suitable for all skin types.',
    image: 'captain-bro-face-pack.jpg',
    inStock: true,
    rating: 4.9
  }
];
