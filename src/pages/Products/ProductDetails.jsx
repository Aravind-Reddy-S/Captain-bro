import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProducts } from '../../services/productService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { FaStar, FaMinus, FaPlus, FaShieldAlt, FaPlay, FaTimes } from 'react-icons/fa';

import RSPMuttonCurry from "../../assets/images/RSPMuttonCurry.png";
import RSPMuttonFry from "../../assets/images/RSPMuttonFry.png";
import RSPMuttonPakora from "../../assets/images/RSPMuttonPakora.png";
import RSPMuttonBiryani from "../../assets/images/RSPMuttonBiryani.png";
import RSPFishPulusu from "../../assets/images/RSPFishPulusu.png";
import RSPFishFry from "../../assets/images/RSPFishFry.png";

// Recipe Video Constants (Hosted on ImageKit)
const IMAGEKIT_BASE = "https://ik.imagekit.io/CaptainBro/tr:orig-true/CaptionBro%20Product%20recipes%20Videos";

const ChickenBiryaniVid = `${IMAGEKIT_BASE}/Chicken%20biryani.mp4`;
const ChickenCurryVid = `${IMAGEKIT_BASE}/Chicken%20Curry.mp4`;
const ChickenFryVid = `${IMAGEKIT_BASE}/Chicken%20fry.mp4`;
const ChickenPakodaVid = `${IMAGEKIT_BASE}/Chicken%20pakoda%20main.mp4`;
const FishFryVid = `${IMAGEKIT_BASE}/Fish%20fry.mov`;
const FishPulusuVid = `${IMAGEKIT_BASE}/Fish%20pulusu%20main.mp4`;
const MuttonBiryaniVid = `${IMAGEKIT_BASE}/Mutton%20biryani.mp4`;
const MuttonCurryVid = `${IMAGEKIT_BASE}/Mutton%20curry.mp4`;
const MuttonFryVid = `${IMAGEKIT_BASE}/Mutton%20Fryone.mp4`;
const MuttonPakodaVid = `${IMAGEKIT_BASE}/Mutton%20pakoda.mp4`;
const PrawnsCurryVid = `${IMAGEKIT_BASE}/Prawns%20curry.mp4`;
const PrawnsFryVid = `${IMAGEKIT_BASE}/Prawns%20fry.mp4`;

// const ChickenBiryaniVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Chicken%20biryani.mp4?updatedAt=1781991771378";
// const ChickenCurryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Chicken%20Curry.mp4?updatedAt=1781993351727";
// const ChickenFryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Chicken%20fry.mp4?updatedAt=1781990668867";
// const ChickenPakodaVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Chicken%20pakoda%20main.mp4?updatedAt=1781991366281";
// const FishFryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Fish%20fry.mp4?updatedAt=1781992219211";
// const FishPulusuVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Fish%20pulusu%20main.mp4?updatedAt=1781990773820";
// const MuttonBiryaniVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Mutton%20biryani.mp4?updatedAt=1781991166176";
// const MuttonCurryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Mutton%20curry.mp4?updatedAt=1781991662571";
// const MuttonFryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Mutton%20Fryone.mp4?updatedAt=1781994146758";
// const MuttonPakodaVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Mutton%20Fryone.mp4?updatedAt=1781994146758";
// const PrawnsCurryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Prawns%20curry.mp4?updatedAt=1781992466783";
// const PrawnsFryVid = "https://ik.imagekit.io/uuwqngqjh/New%20Folder/Prawns%20fry.mp4?updatedAt=1781992382188";


import RSPPrawnsCurry from "../../assets/images/RSPPrawnsCurry.png";
import RSPPrawnsFry from "../../assets/images/RSPPrawnsFry.png";
import RSPPrawnsBiryani from "../../assets/images/RSPPrawnsBiryani.png";

import ChickenBiryaniImg from '../../assets/images/RSPChickenBiryani.png';
import chickenCurry from '../../assets/images/RSPChickenCurry.png';
import chickenFry from '../../assets/images/RSPChickenFry.png';
import rspChickenFry from '../../assets/images/RSPChickenFry.png';
import ChickenPakora from '../../assets/images/RSPChickenPakora.png';
import recipeVideoImg from '../../assets/images/recipe-video.png';
import muttonCurryImg from '../../assets/images/mutton-curry.png';
import koramanuFishImg from '../../assets/images/koramanu-fish.png';
import ravaFishImg from '../../assets/images/rava-fish.png';
import prawnsImg from '../../assets/images/prawns.png';
import fruitsCategoryImg from '../../assets/images/fruits-category.png';
import lemonImg from '../../assets/images/lemon.png';

const frequentlyBoughtItems = [
  {
    id: 'f1',
    name: "Fresh Coriander Bunch",
    teluguName: "కొత్తిమీర కట్ట",
    hindiName: "धनिया पत्ता",
    image: "coriander.png",
    originalPrice: 12,
    discountedPrice: 10,
    discount: "17% OFF",
    weight: "50g",
  },
  {
    id: 'f2',
    name: "Fresh Mint Leaves Bunch",
    teluguName: "పుదీనా కట్ట",
    hindiName: "पुदीना पत्ता",
    image: "mint.png",
    originalPrice: 15,
    discountedPrice: 12,
    discount: "20% OFF",
    weight: "50g",
  },
  {
    id: 'f3',
    name: "Organic Lemon Pack",
    teluguName: "నిమ్మకాయలు",
    hindiName: "नींबू",
    image: "lemon.png",
    originalPrice: 24,
    discountedPrice: 20,
    discount: "17% OFF",
    weight: "5P",
  },
  {
    id: 'f4',
    name: "Fresh Green Chillies",
    teluguName: "పచ్చి మిరపకాయలు",
    hindiName: "हरी मिर्च",
    image: "green-chillies.png",
    originalPrice: 18,
    discountedPrice: 15,
    discount: "17% OFF",
    weight: "250g",
  },
  {
    id: 'f5',
    name: "Fresh Ginger Garlic Paste",
    teluguName: "అల్లం వెల్లుల్లి పేస్ట్",
    hindiName: "अदरक लहसुन पेस्ट",
    image: "ginger-garlic-paste.png",
    originalPrice: 54,
    discountedPrice: 45,
    discount: "17% OFF",
    weight: "100g",
  },
  {
    id: 'f6',
    name: "Organic Farm Onions",
    teluguName: "ఉల్లిపాయలు",
    hindiName: "प्याज़",
    image: "onions.png",
    originalPrice: 42,
    discountedPrice: 35,
    discount: "17% OFF",
    weight: "500g",
  },
  {
    id: 'f7',
    name: "Whole Raw Masala Mix",
    teluguName: "మసాలా దినుసులు",
    hindiName: "खड़ा मसाला",
    image: "raw-masala-mix.png",
    originalPrice: 60,
    discountedPrice: 50,
    discount: "17% OFF",
    weight: "25 grams",
  },
  {
    id: 'f8',
    name: "Warangal Special Masala",
    teluguName: "మసాలా పొడి",
    hindiName: "गरम मसाला",
    image: "masala-powder.png",
    originalPrice: 96,
    discountedPrice: 80,
    discount: "17% OFF",
    weight: "25g",
  },
  {
    id: 'f9',
    name: "Guntur Red Chilli Powder",
    teluguName: "కారం పొడి",
    hindiName: "लाल मिर्च पाउडर",
    image: "chilli-powder.png",
    originalPrice: 72,
    discountedPrice: 60,
    discount: "17% OFF",
    weight: "1Kg",
  },
  {
    id: 'f10',
    name: "Fresh Thick Curd Cup",
    teluguName: "పెరుగు",
    hindiName: "दही",
    image: "curd.png",
    originalPrice: 36,
    discountedPrice: 30,
    discount: "17% OFF",
    weight: "100g, 250g",
  },
  {
    id: 'f11',
    name: "Pure Sunflower Cooking Oil",
    teluguName: "వంట నూనె",
    hindiName: "खाना पकाने का तेल",
    image: "cooking-oil.png",
    originalPrice: 174,
    discountedPrice: 145,
    discount: "17% OFF",
    weight: "1L",
  },
  {
    id: 'f12',
    name: "Premium Basmati Rice",
    teluguName: "బాస్మతి బియ్యం",
    hindiName: "बासमती चावल",
    image: "basmati-rice.png",
    originalPrice: 144,
    discountedPrice: 120,
    discount: "17% OFF",
    weight: "1Kg",
  },
  {
    id: 'f13',
    name: "Jai Sri Ram Rice",
    teluguName: "జై శ్రీరామ్ బియ్యం",
    hindiName: "जय श्रीराम चावल",
    image: "jai-sri-ram-rice.png",
    originalPrice: 60,
    discountedPrice: 45,
    discount: "10% OFF",
    weight: "1Kg",
  }
];

const CATEGORY_RECIPES = {
  chicken: [
    {
      name: "Special Chicken Curry",
      time: "45 Mins",
      difficulty: "Medium",
      image: chickenCurry,
      video: ChickenCurryVid
    },
    {
      name: "Special Chicken Biryani",
      time: "15 Mins Video",
      difficulty: "Easy",
      image: ChickenBiryaniImg,
      video: ChickenBiryaniVid
    },
    {
      name: "Special Chicken Pakora",
      time: "40 Mins",
      difficulty: "Medium",
      image: ChickenPakora,
      video: ChickenPakodaVid
    },
    {
      name: "Special Chicken Fry",
      time: "30 Mins",
      difficulty: "Easy",
      image: chickenFry,
      video: ChickenFryVid
    }
  ],
  mutton: [
    {
      name: "Special Mutton Curry",
      time: "60 Mins",
      difficulty: "Medium",
      image: RSPMuttonCurry,
      video: MuttonCurryVid
    },
    {
      name: "Special Mutton Biryani",
      time: "12 Mins Video",
      difficulty: "Easy",
      image: RSPMuttonBiryani,
      video: MuttonBiryaniVid
    },
    {
      name: "Special Mutton Fry",
      time: "50 Mins",
      difficulty: "Medium",
      image: RSPMuttonFry,
      video: MuttonFryVid
    },
    {
      name: "Special Mutton Pakora",
      time: "70 Mins",
      difficulty: "Hard",
      image: RSPMuttonPakora,
      video: MuttonPakodaVid
    }
  ],
  fish: [
    {
      name: "Telangana Fish Pulusu",
      time: "35 Mins",
      difficulty: "Medium",
      image: RSPFishPulusu,
      video: FishPulusuVid
    },
    {
      name: "Special Fish Fry",
      time: "25 Mins",
      difficulty: "Easy",
      image: RSPFishFry,
      video: FishFryVid
    }
  ],
  prawns: [
    {
      name: "Special Prawns Curry",
      time: "25 Mins",
      difficulty: "Easy",
      image: RSPPrawnsCurry,
      video: PrawnsCurryVid
    },
    {
      name: "Special Prawns Fry",
      time: "30 Mins",
      difficulty: "Easy",
      image: RSPPrawnsFry,
      video: PrawnsFryVid
    },
    {
      name: "Special PrawnsBiryani",
      time: "14 Mins Video",
      difficulty: "Easy",
      image: RSPPrawnsBiryani,
      video: PrawnsFryVid
    }
  ],
  vegetables: [
    {
      name: "Telangana Gutti Vankaya Kura (Stuffed Brinjal)",
      time: "40 Mins",
      difficulty: "Medium",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=350"
    },
    {
      name: "Warangal Tomato Sherva",
      time: "25 Mins",
      difficulty: "Easy",
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=350"
    }
  ],
  grocery: [
    {
      name: "Authentic Telangana Bagara Rice",
      time: "30 Mins",
      difficulty: "Easy",
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=350"
    },
    {
      name: "Telangana Pachi Pulusu (Raw Tamarind Rasam)",
      time: "15 Mins",
      difficulty: "Easy",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=350"
    }
  ],
  fruits: [
    {
      name: "Fresh Fruit Salad with Honey Drizzle",
      time: "10 Mins",
      difficulty: "Easy",
      image: fruitsCategoryImg
    },
    {
      name: "Telangana Special Lemon Sharbath",
      time: "5 Mins",
      difficulty: "Easy",
      image: lemonImg
    }
  ]
};

const calculateTotalWeight = (weightStr, q) => {
  if (!weightStr) return '';
  const match = weightStr.match(/^(\d+)(.*)$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (weightStr.includes(',')) {
      const firstPart = weightStr.split(',')[0].trim();
      const partMatch = firstPart.match(/^(\d+)(.*)$/);
      if (partMatch) {
        return `${parseInt(partMatch[1], 10) * q}${partMatch[2]}`;
      }
    }
    return `${value * q}${unit}`;
  }
  if (weightStr.toLowerCase().includes('bunch')) {
    return `${q} ${q === 1 ? 'bunch' : 'bunches'}`;
  }
  return `${q} x ${weightStr}`;
};

export const ProductDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [frequentQuantities, setFrequentQuantities] = useState({});
  const [instructions, setInstructions] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCuttingType, setSelectedCuttingType] = useState('Curry Cut (Small)');

  const recipes = product ? (CATEGORY_RECIPES[product.category] || CATEGORY_RECIPES.grocery) : [];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, products] = await Promise.all([
          getProductById(id),
          getProducts()
        ]);
        setProduct(data);
        setAllProducts(products);
        setSelectedCuttingType('Curry Cut (Small)');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const showCuttingType = (product.category === 'chicken' || product.category === 'mutton') && !product.name.toLowerCase().includes('drumstick') && !product.name.toLowerCase().includes('skin');
      // Add main product with selected cutting type if applicable
      const productWithSelection = {
        ...product,
        ...(showCuttingType ? { cuttingType: selectedCuttingType } : {})
      };
      addToCart(productWithSelection, quantity);

      // Add frequently bought together items
      enrichedFrequentItems.forEach((item) => {
        const q = frequentQuantities[item.id] || 0;
        if (q > 0) {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.discountedPrice,
            weight: item.weight,
            image: item.image
          }, q);
        }
      });

      // Save instructions to localStorage
      if (instructions.trim()) {
        localStorage.setItem('checkout_instructions', instructions);
      }

      navigate('/cart');
    }
  };

  const getImageUrl = (imageName) => {
    try {
      if (!imageName) return '';
      if (imageName.startsWith('data:image') || imageName.startsWith('http') || imageName.startsWith('/')) {
        return imageName;
      }
      return new URL(`../../assets/images/${imageName}`, import.meta.url).href;
    } catch (e) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
    }
  };

  // Enrich frequentlyBoughtItems with real prices from Firestore
  const enrichedFrequentItems = frequentlyBoughtItems.map((item) => {
    const match = allProducts.find(
      (p) => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    return {
      ...item,
      discountedPrice: match ? match.price : item.discountedPrice,
      originalPrice: match ? Math.round(match.price * 1.2) : item.originalPrice,
    };
  });

  // Calculations for Frequently Bought Together & Bill Details
  const mainProductTotal = product ? (product.price * quantity) : 0;
  const frequentItemsTotal = product ? enrichedFrequentItems.reduce((sum, item) => {
    const q = frequentQuantities[item.id] || 0;
    return sum + (item.discountedPrice * q);
  }, 0) : 0;

  const itemsTotal = mainProductTotal + frequentItemsTotal;

  const totalSelectedItems = quantity + enrichedFrequentItems.reduce((sum, item) => {
    return sum + (frequentQuantities[item.id] || 0);
  }, 0);

  const deliveryCharge = 20;
  const packagingCharge = 10;
  const totalAmount = itemsTotal + deliveryCharge + packagingCharge;

  const renderQuantitySelector = (item) => {
    const q = frequentQuantities[item.id] || 0;
    if (q === 0) {
      return (
        <button
          onClick={() => setFrequentQuantities(prev => ({ ...prev, [item.id]: 1 }))}
          className="px-4 py-1.5 bg-[#8B0000] text-white rounded-lg hover:bg-red-800 transition-all font-black text-xs md:text-sm shadow-sm flex items-center gap-1 active:scale-95 min-w-[80px] justify-center"
        >
          <span>ADD</span>
          <FaPlus className="text-[9px] md:text-xs" />
        </button>
      );
    }
    const borderClass = q > 0 ? 'border-[#8B0000]' : 'border-neutral-border/80';
    return (
      <div className={`flex items-center border ${borderClass} rounded-lg overflow-hidden h-8 md:h-9 bg-white transition-all duration-300 shadow-2xs`}>
        <button
          onClick={() => setFrequentQuantities(prev => ({ ...prev, [item.id]: Math.max(0, q - 1) }))}
          className="w-8 md:w-9 h-full bg-[#8B0000] text-white flex items-center justify-center hover:bg-red-800 transition-all font-bold"
        >
          <FaMinus className="text-[9px] md:text-xs" />
        </button>
        <span className="px-3 font-extrabold text-[#8B0000] text-xs md:text-sm min-w-[28px] md:min-w-[32px] text-center">
          {q}
        </span>
        <button
          onClick={() => setFrequentQuantities(prev => ({ ...prev, [item.id]: q + 1 }))}
          className="w-8 md:w-9 h-full bg-[#8B0000] text-white flex items-center justify-center hover:bg-red-800 transition-all font-bold"
        >
          <FaPlus className="text-[9px] md:text-xs" />
        </button>
      </div>
    );
  };

  if (loading) return <Loader fullPage={true} />;

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-neutral-dark opacity-60">Product not found.</p>
        <Button onClick={() => navigate('/products')} className="mt-4">Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light flex flex-col ">
      {/* Product Image Frame (Larger image h-80) */}
      <div className="bg-white mb-2 h-[320px] w-full flex items-center justify-center border-b border-neutral-border relative">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
          }}
        />
        {/* Rating Badge (rounded-md) */}
        <div className="absolute top-4 left-4 bg-primary-light text-primary px-3 py-1 rounded-md flex items-center gap-1 text-xs font-bold border border-primary/10">
          <FaStar className="text-secondary" />
          <span>{product.rating || '5.0'} Rating</span>
        </div>
      </div>

      {/* Details Box (rounded-t-lg - 8px) */}
      <div className="bg-white p-3  flex flex-col gap-4 text-left flex-1 shadow-inner">
        <div>
          <span className="text-[10px] bg-neutral-light text-neutral-dark font-bold px-2.5 py-1 rounded-md border border-neutral-border/40 uppercase tracking-widest">
            {product.category}
          </span>
          <h2 className="text-xl font-extrabold text-neutral-dark mt-2.5">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-neutral-dark opacity-60">
              Weight: {product.weight}
            </span>
            <span className="h-3 w-px bg-neutral-border"></span>
            <span className="text-xs font-bold text-green-600">
              100% Farm Fresh
            </span>
          </div>
        </div>

        {/* Price & Quantity Adjuster (rounded-md) */}
        <div className="flex flex-col py-3 border-y border-neutral-border gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-dark/40 line-through leading-none">
                {formatPrice(product.price * 1.2)}
              </span>
              <span className="text-2xl font-black text-neutral-dark mt-0.5">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="flex items-center border border-neutral-border rounded-md bg-neutral-light overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 text-neutral-dark hover:bg-neutral-border/40 transition-all"
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="px-4 font-bold text-[#8B0000] text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="p-3 text-neutral-dark hover:bg-neutral-border/40 transition-all"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>
          </div>

          {/* Selected Add-ons / Frequently Bought Items Summary */}
          {/* {Object.values(frequentQuantities).some(q => q > 0) && (
            <div className="bg-primary-light/10 border border-primary/20 rounded-xl p-3.5 mt-1 transition-all duration-300">
              <h4 className="text-xs font-black text-neutral-dark opacity-75 uppercase tracking-wider mb-2">
                Selected Add-ons
              </h4>
              <div className="flex flex-col gap-2">
                {frequentlyBoughtItems.map((item) => {
                  const q = frequentQuantities[item.id] || 0;
                  if (q > 0) {
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-white border border-neutral-border/50 rounded-lg p-2.5 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover border border-neutral-border/40"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150';
                            }}
                          />
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs font-extrabold text-neutral-dark truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-dark/50 font-semibold leading-none mt-0.5">
                              {formatPrice(item.discountedPrice)} / {item.weight}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-neutral-dark min-w-[45px] text-right">
                            {formatPrice(item.discountedPrice * q)}
                          </span>
                          
                          <div className="flex items-center border border-neutral-border rounded-md bg-neutral-light overflow-hidden h-7">
                            <button
                              onClick={() => setFrequentQuantities(prev => ({ ...prev, [item.id]: Math.max(0, q - 1) }))}
                              className="px-2 text-neutral-dark hover:bg-neutral-border/40 transition-all h-full flex items-center justify-center"
                            >
                              <FaMinus className="text-[8px]" />
                            </button>
                            <span className="px-2 font-bold text-[#8B0000] text-xs">
                              {q}
                            </span>
                            <button
                              onClick={() => setFrequentQuantities(prev => ({ ...prev, [item.id]: q + 1 }))}
                              className="px-2 text-neutral-dark hover:bg-neutral-border/40 transition-all h-full flex items-center justify-center"
                            >
                              <FaPlus className="text-[8px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )} */}
        </div>

        {/* Cutting Type Selection (Only for Chicken & Mutton, excluding Drumsticks & Skin) */}
        {(product.category === 'chicken' || product.category === 'mutton') && !product.name.toLowerCase().includes('drumstick') && !product.name.toLowerCase().includes('skin') && (
          <div className="flex flex-col gap-3 py-3.5 border-b border-neutral-border text-left">
            <div className="flex flex-col">
              <h4 className="text-xs font-black text-neutral-dark opacity-75 uppercase tracking-wider">
                Select Cutting Type
              </h4>
              <p className="text-[10px] text-neutral-dark/45 font-semibold mt-0.5">Customize how your fresh cuts are sliced by the kitchen</p>
            </div>

            <div className={`grid ${product.name.toLowerCase().includes('boneless') ? 'grid-cols-2' : 'grid-cols-3'} gap-2 mt-1`}>
              {[
                { id: 'small', label: 'Curry Cut (Small)', desc: 'Quick cooking, small pieces' },
                { id: 'big', label: 'Curry Cut (Big)', desc: 'Thick gravies, standard size' },
                { id: 'biryani', label: 'Biryani Cut', desc: 'Large, bone-in succulent cuts' }
              ].filter((option) => {
                // Remove Biryani cut option for boneless items
                if (product.name.toLowerCase().includes('boneless') && option.id === 'biryani') {
                  return false;
                }
                return true;
              }).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedCuttingType(option.label)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative ${selectedCuttingType === option.label
                    ? 'border-primary bg-primary-light/20 text-primary ring-1 ring-primary'
                    : 'border-neutral-border/60 bg-white hover:border-neutral-dark/30'
                    }`}
                >
                  <span className="text-xs font-black block">
                    {option.label}
                  </span>
                  <span className="text-[9px] font-bold text-neutral-dark/45 mt-1 leading-tight block">
                    {option.desc}
                  </span>
                  {selectedCuttingType === option.label && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
            Product Description
          </h4>
          <p className="text-xs text-neutral-dark/70 font-semibold leading-relaxed">
            {product.description}
          </p>
        </div>



        {/* Recipes Recommendation section */}
        {recipes && recipes.length > 0 && product.category !== 'vegetables' && product.category !== 'grocery' && product.category !== 'fruits' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-extrabold text-neutral-dark">
                Recipes Recommendations 🧑‍🍳
              </h3>
              <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">
                Easy, delicious ways to cook your fresh cuts
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {recipes.map((recipe, idx) => (
                <div key={idx} className="flex flex-col gap-2 flex-shrink-0 w-60 group">
                  <div
                    onClick={() => recipe.video && setSelectedVideo(recipe.video)}
                    className="w-full h-28 bg-white border border-neutral-border rounded-md overflow-hidden shadow-xs  transition-all duration-300 cursor-pointer relative"
                  >
                    <img
                      src={getImageUrl(recipe.image)}
                      alt={recipe.name || 'Recipe Video'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';
                      }}
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:bg-black/40 transition-all duration-300">
                      <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300">
                        <FaPlay className="text-[#8B0000] text-xs ml-0.5" />
                      </div>
                    </div>
                  </div>
                  {/* Heading Name below card */}
                  <h4 className="text-xs font-extrabold text-neutral-dark text-left line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {recipe.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Frequently Bought Together */}
        <div className="flex flex-col gap-3.5">
          <h3 className="text-base md:text-lg font-black text-neutral-dark text-left">
            Frequently Bought Together
          </h3>
          <div className="flex flex-col gap-3">
            {enrichedFrequentItems.map((item) => {
              const q = frequentQuantities[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`border ${q > 0 ? 'border-primary/30 bg-primary-light/5' : 'border-neutral-border/60 bg-white'
                    } p-3 rounded-xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-primary/20 transition-all duration-300 group`}
                >
                  <div className="flex gap-3.5 items-center flex-1 min-w-0">
                    {/* Larger addon image w-24 h-24 with rounded-lg */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-neutral-border/40 bg-neutral-light/50 flex-shrink-0 relative">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150';
                        }}
                      />
                      {/* Subtle category or unit tag on image */}
                      <span className="absolute bottom-1.5 left-1.5 bg-neutral-dark/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {item.weight}
                      </span>
                    </div>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <h4 className="text-sm md:text-base font-black text-neutral-dark truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-xs md:text-sm font-semibold text-neutral-dark/50 mt-1 truncate">
                        {item.teluguName} {item.hindiName ? `• ${item.hindiName}` : ''}
                      </span>
                      {/* Price display below details */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-sm md:text-base font-black text-neutral-dark">
                          {formatPrice(item.discountedPrice)}
                        </span>
                        <span className="text-xs md:text-sm text-neutral-dark/40 font-bold">
                          / pack
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity stack and Selector Button on the right */}
                  <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0 ml-3">
                    {q > 0 ? (
                      <div className="bg-primary-light/50 px-2.5 py-1.5 flex flex-col items-end text-right min-w-[85px] rounded">
                        <span className="text-[10px] md:text-xs font-extrabold text-[#8B0000] leading-none uppercase tracking-wider">
                          {calculateTotalWeight(item.weight, q)}
                        </span>
                        <span className="text-sm md:text-base font-black text-neutral-dark mt-1 leading-none">
                          {formatPrice(item.discountedPrice * q)}
                        </span>
                      </div>
                    ) : (
                      /* Empty placeholder slot to preserve layout height and avoid card shifting */
                      <div className="h-[34px] w-[85px]"></div>
                    )}
                    {renderQuantitySelector(item)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Details Section (rounded-lg - 8px) */}
        <div className="bg-white p-4 rounded-lg border border-neutral-border text-left shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-neutral-dark">
            Bill Details
          </h3>

          <div className="flex flex-col gap-2 text-xs font-semibold text-neutral-dark/70">
            {/* Itemized List */}
            <div className="flex flex-col gap-1.5 border-b border-neutral-border/50 pb-2">
              {/* Main Product */}
              {quantity > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-dark opacity-85">{product.name} <span className="text-neutral-dark/45 font-bold">x {quantity}</span></span>
                  <span className="font-bold text-neutral-dark">{formatPrice(product.price * quantity)}</span>
                </div>
              )}
              {/* Addons */}
              {enrichedFrequentItems.map((item) => {
                const q = frequentQuantities[item.id] || 0;
                if (q > 0) {
                  return (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-neutral-dark opacity-85">{item.name} <span className="text-neutral-dark/45 font-bold">x {q}</span></span>
                      <span className="font-bold text-neutral-dark">{formatPrice(item.discountedPrice * q)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="flex justify-between mt-1">
              <span>Items Total ({totalSelectedItems} Items)</span>
              <span>{formatPrice(itemsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging Charge</span>
              <span>{formatPrice(packagingCharge)}</span>
            </div>
          </div>

          <div className="h-px bg-neutral-border my-1"></div>

          <div className="flex justify-between items-center text-sm font-black text-neutral-dark">
            <span>Total Amount</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Additional Instructions (rounded-lg - 8px) */}
        <div className="flex flex-col gap-2 text-left mb-6">
          <h4 className="text-xs font-extrabold text-neutral-dark opacity-50 uppercase tracking-wider">
            Add Additional Instruction's
          </h4>
          <textarea
            rows="3"
            placeholder="write some instruction's..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 rounded-lg border border-neutral-border bg-white text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          ></textarea>
        </div>

        {/* Spacer to prevent content overlap with fixed bottom bar */}
        <div className="h-24"></div>
      </div>

      {/* Fixed Bottom Add to Cart Bar (fixed position just above bottom navbar - 16) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-neutral-border p-4 z-30 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-neutral-dark/45 font-bold uppercase tracking-wider">
            {totalSelectedItems} {totalSelectedItems === 1 ? 'Item' : 'Items'} selected
          </span>
          <span className="text-lg font-black text-neutral-dark mt-0.5">
            {formatPrice(itemsTotal)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold rounded-lg transition-all shadow-md shadow-primary/15 active:scale-95 flex items-center gap-2"
        >
          <span>Add to Cart</span>
        </button>
      </div>

      {/* Video Modal Overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-black rounded-2xl overflow-hidden max-w-[360px] w-full aspect-[9/16] max-h-[82vh] relative border border-white/10 shadow-2xl flex items-center justify-center">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors z-50 bg-black/60 p-2.5 rounded-full active:scale-95 shadow-lg border border-white/10"
            >
              <FaTimes className="text-xs" />
            </button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductDetails;
