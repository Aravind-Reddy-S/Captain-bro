import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import { getProducts } from '../../services/productService';
import CategoryCard from '../../components/product/CategoryCard';
import ProductCard from '../../components/product/ProductCard';
import Loader, { SkeletonList } from '../../components/common/Loader';
import { FaSearch, FaChevronRight, FaStar } from 'react-icons/fa';
import { CLOUD_KITCHEN_DISHES } from '../../utils/cloudKitchenData';
import { formatPrice } from '../../utils/formatPrice';
import LocationPopup from '../../components/common/LocationPopup';
import BannerImg1 from "../../assets/images/mobilebannerone.png"
import BannerOne from "../../assets/images/bannerone.png";
import BannerTwo from "../../assets/images/bannertwo.png";
import BannerThree from "../../assets/images/bannerthree.png";
import BannerFour from "../../assets/images/bannerfour.png";
import FoodItems from "../../assets/images/fooditems.png";
import GroceriesImg from "../../assets/images/groceriesImg.png";
import CloudKitImg from "../../assets/images/CloudKitImg.png";
import CloudKitchenBanner from "../../assets/images/CloudKitchenBanner.png";
import MedicineSection from '../../components/common/MedicineSection';

export const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const slideBanners = [
    { img: BannerOne, category: 'vegetables', label: 'Fresh Vegetables 🥬' },
    { img: BannerTwo, category: 'fruits', label: 'Fresh Fruits 🍎' },
    { img: BannerThree, category: 'grocery', label: 'Daily Grocery 🛒' },
    { img: BannerFour, category: 'chicken', label: 'Fresh Non-Veg 🍗' },
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideBanners.length);
    }, 3500);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    // Check if user just logged in to show location picker
    if (localStorage.getItem('just_logged_in') === 'true') {
      setIsLocationOpen(true);
      localStorage.removeItem('just_logged_in');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    navigate(`/products?category=${categoryId}`);
  };

  const recommendedIds = ['p40', 'p45', 'p1', 'p54'];
  const mappedRecommendations = recommendedIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory).slice(0, 4)
    : (mappedRecommendations.length > 0 ? mappedRecommendations : products.slice(0, 4));

  const vegetables = products.filter(p => p.category === 'vegetables');
  const fruits = products.filter(p => p.category === 'fruits');
  const groceries = products.filter(p => p.category === 'grocery');
  const captainBroProducts = products.filter(p => p.name?.toLowerCase().includes('captain bro'));

  const autocompleteSuggestions = searchQuery.trim()
    ? products.filter(p => {
      const query = searchQuery.toLowerCase();
      return (
        p.name?.toLowerCase().includes(query) ||
        p.teluguName?.toLowerCase().includes(query) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(query)) ||
        p.category?.toLowerCase().includes(query)
      );
    }).slice(0, 5)
    : [];

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 ">



      {/* Search Input */}
      <div className="relative w-full search-container z-30">
        <input
          type="text"
          placeholder="Search for mutton, chicken, fish, greens..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setShowSuggestions(false);
              navigate(`/products?search=${searchQuery}`);
            }
          }}
          className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-neutral-border bg-white transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm"
        />
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-dark/40 text-sm" />

        {/* Search Intelligence Dropdown */}
        {showSuggestions && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-border rounded-lg shadow-lg overflow-hidden flex flex-col text-left z-50 max-h-[300px] overflow-y-auto">
            {autocompleteSuggestions.length > 0 ? (
              autocompleteSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setShowSuggestions(false);
                    setSearchQuery('');
                    navigate(`/product/${item.id}`);
                  }}
                  className="flex items-center gap-3 p-3 border-b border-neutral-border/50 hover:bg-neutral-light transition-all text-left w-full cursor-pointer"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-10 h-10 rounded-md object-cover border border-neutral-border/30 bg-neutral-light flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150';
                    }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-black text-neutral-dark truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-neutral-dark/50 capitalize font-bold">
                      {item.teluguName || item.category} {item.hindiName ? `• ${item.hindiName}` : ''}
                    </span>
                  </div>
                  <span className="text-xs font-black text-primary ml-auto">
                    {formatPrice(item.price)}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs font-semibold text-neutral-dark opacity-60">
                No matching fresh items found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Banner */}
      {/* <div
        className="w-full rounded-lg p-5 text-white flex flex-col items-start text-left relative overflow-hidden shadow-lg shadow-primary/15"
        style={{
          background: 'linear-gradient(135deg, #8B0000 0%, #5C0000 100%)'
        }}
      >
        <div className="absolute top-0 right-0 opacity-15 translate-x-4 -translate-y-4 text-[130px]">
          🥩
        </div>
        <span className="bg-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-widest border border-white/10 mb-2">
          LIMITED DISCOUNT
        </span>
        <h3 className="text-xl font-extrabold leading-tight max-w-[200px]">
          Flat 20% Off on Fresh Mutton Cuts
        </h3>
        <p className="text-[10px] text-white/80 font-medium mt-1">
          Directly sourced from trusted regional breeders.
        </p>
        <button
          onClick={() => navigate('/products?category=mutton')}
          className="mt-4 px-4 py-2 bg-white text-primary text-xs font-bold rounded-md shadow-md active:scale-95 hover:bg-neutral-light transition-all"
        >
          Shop Mutton Now
        </button>
      </div> */}

      {/* Auto-sliding Banner Showcase */}
      <div className="flex flex-col gap-2.5 w-full">
        <div className="relative w-full rounded-lg overflow-hidden border border-neutral-border shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out w-full"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slideBanners.map((banner, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 relative cursor-pointer group"
                onClick={() => navigate(`/products?category=${banner.category}`)}
              >
                <img
                  src={banner.img}
                  alt={banner.label}
                  className="w-full h-auto block group-active:opacity-95 transition-opacity"
                />
                {/* Category tap hint overlay */}
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {banner.label} →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots with category labels */}
        <div className="flex justify-center gap-1.5 py-1">
          {slideBanners.map((banner, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              title={banner.label}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === index ? 'bg-primary w-4' : 'bg-neutral-dark/25 hover:bg-neutral-dark/45 w-2'
                }`}
              aria-label={`Go to ${banner.label}`}
            />
          ))}
        </div>

      </div>


      {/* Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Shop by Category
          </h3>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Fresh Meat */}

          <div
            onClick={() => navigate('/products?category=our-products')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full aspect-square rounded-xl border border-neutral-border/60 bg-white overflow-hidden  flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300">
              <img
                src={FoodItems}
                alt="Our Products"
                className="w-full rounded-md h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span className="text-[11px] font-extrabold text-neutral-dark text-center mt-1.5 leading-tight">
              Our Products
            </span>
          </div>
          {/* Card 2: Vegetables & Fruits */}
          <div
            onClick={() => navigate('/products?category=vegetables,fruits')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full aspect-square rounded-xl border border-neutral-border/60 bg-white overflow-hidden  flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300">
              <img
                src={getImageUrl('fruits-category.png')}
                alt="Vegetables & Fruits"
                className="w-full h-full rounded-md object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span className="text-[11px] font-extrabold text-neutral-dark text-center mt-1.5 leading-tight">
              Vegetables & Fruits
            </span>
          </div>

          {/* Card 3: Groceries */}

          <div
            onClick={() => navigate('/products?category=chicken,mutton,fish,prawns')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full aspect-square rounded-xl border border-neutral-border/60 bg-white overflow-hidden  flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300">
              <img
                src={getImageUrl('chicken-category.png')}
                alt="Fresh Meat"
                className="w-full h-full rounded-md object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span className="text-[11px] font-extrabold text-neutral-dark text-center mt-1.5 leading-tight">
              Fresh Meat
            </span>
          </div>
          {/* Card 4: Our Products */}
          <div
            onClick={() => navigate('/products?category=grocery')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full aspect-square rounded-xl border border-neutral-border/60 bg-white overflow-hidden  flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300">
              <img
                src={GroceriesImg}
                alt="Groceries"
                className="w-full rounded-md h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span className="text-[11px] font-extrabold text-neutral-dark text-center mt-1.5 leading-tight">
              Groceries
            </span>
          </div>
        </div>
      </div>



      {/* Best Selling Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Top Recommendations
          </h3>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      {/* Our Products Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Our Products ✨
          </h3>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {captainBroProducts.length === 0 ? (
              <div className="text-xs font-semibold text-neutral-dark/40 py-4 w-full text-center">
                No products available at the moment.
              </div>
            ) : (
              captainBroProducts.map((p) => (
                <div key={p.id} className="min-w-[160px] w-[160px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>
        )}
      </div>


      {/* Fresh Vegetables Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Fresh Vegetables 🥬
          </h3>
          <button
            onClick={() => navigate('/products?category=vegetables')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {vegetables.map((p) => (
              <div key={p.id} className="min-w-[160px] w-[160px] flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fresh Fruits Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Fresh Fruits 🍎
          </h3>
          <button
            onClick={() => navigate('/products?category=fruits')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {fruits.length === 0 ? (
              <div className="text-xs font-semibold text-neutral-dark/40 py-4 w-full text-center">
                No fresh fruits available at the moment.
              </div>
            ) : (
              fruits.map((p) => (
                <div key={p.id} className="min-w-[160px] w-[160px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* Our Products Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Our Products ✨
          </h3>
          <button
            onClick={() => navigate('/products?category=our-products')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {captainBroProducts.length === 0 ? (
              <div className="text-xs font-semibold text-neutral-dark/40 py-4 w-full text-center">
                No products available at the moment.
              </div>
            ) : (
              captainBroProducts.map((p) => (
                <div key={p.id} className="min-w-[160px] w-[160px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Daily Groceries Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-neutral-dark">
            Daily Groceries 🧂
          </h3>
          <button
            onClick={() => navigate('/products?category=grocery')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
          >
            See All <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <SkeletonList count={2} />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {groceries.map((p) => (
              <div key={p.id} className="min-w-[160px] w-[160px] flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Badges */}


      {/* Promo Banner Section */}
      <div className="w-full rounded overflow-hidden border border-neutral-border shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer">
        <img
          src={BannerImg1}
          alt="Special Promotion"
          className="w-full h-auto object-cover block"
          onClick={() => navigate('/products')}
        />
      </div>





      {/* Testimonials Section */}
      <div className="flex flex-col gap-3 text-left">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-base font-bold text-neutral-dark">Loved by Locals ❤️</h3>
            <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">1,200+ verified ratings in Warangal</p>
          </div>
        </div>

        {/* Scrollable Testimonials List */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {/* Testimonial 1 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "Hostel food bore kottinappudu directly ordering chicken wings from here! Acha quality and clean packaging, super fast delivery too. చికెన్ చాలా బాగుంది!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Abhishek S. (NIT W)</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">21 yrs • Student</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "ఉల్లిపాయలు, కొత్తిమీర చాలా తాజాగా ఉన్నాయి! Very fresh organic vegetables. Direct గా ఇంటికే డెలివరీ చేయడం వల్ల మార్కెట్ కి వెళ్లే శ్రమ తగ్గింది. ధన్యవాదాలు!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Sireesha K.</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">42 yrs • Homemaker • Kazipet</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "Sundays are meat days! Mutton and chicken clean గా కట్ చేసి vacuum packs లో వస్తాయి. Acha hygienic meat milta hai yahan. Saves lots of time. చాలా హ్యాపీ!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Javeed Ahmed</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">31 yrs • Techie • Naimnagar</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>

          {/* Testimonial 4 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "ఈ వయస్సులో మార్కెట్ కి వెళ్ళడం కష్టం. But my grandson ordered Koramanu (చేపలు) from here. చాలా శుభ్రంగా కడిగి పంపారు. నిమ్మకాయలు కూడా చాలా బాగున్నాయి. గాడ్ బ్లెస్స్ యు!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Rao Garu</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">65 yrs • Retired • Hunter Road</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>

          {/* Testimonial 5 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "Daily grocery and fresh vegetables subah-subah deliver ho jate hain. Cooking oil and curd packaging is top-class. అల్లం వెల్లుల్లి పేస్ట్ కూడా తాజా వాసన వస్తుంది. Perfect!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Priya Sharma</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">28 yrs • Bank Mgr • Subedari</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>

          {/* Testimonial 6 */}
          <div className="min-w-[240px] w-[240px] bg-white border border-neutral-border/80 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
            <p className="text-[10px] text-neutral-dark/80 font-semibold italic leading-relaxed">
              "Watch Live Packing feature is excellent! కళ్ళముందే కట్ చేసి ప్యాక్ చేస్తారు. No cheating. Meat is extremely fresh, curry and biryani cuts are perfect. బెస్ట్ క్వాలిటీ!"
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-black text-neutral-dark">Ramesh Reddy</h5>
                <span className="text-[8px] text-neutral-dark/40 font-bold">48 yrs • Business • Waddepally</span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
                <FaStar className="text-[9px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <LocationPopup isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </div>
  );
};
export default Home;
