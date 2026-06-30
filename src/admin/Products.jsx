import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { uploadProductImage } from '../firebase/storage';
import { formatPrice } from '../utils/formatPrice';
import { CATEGORIES } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { FaTrash, FaEdit, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';

const PRICE_STEPS = [1, 5, 10];

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingPrice, setSavingPrice] = useState({});
  const [savedPrice, setSavedPrice] = useState({});
  const [priceStep, setPriceStep] = useState(10);
  const [toast, setToast] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('chicken');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setImage(uploadedUrl);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Inline quick price update — optimistic UI + immediate Firestore save
  const handleQuickPrice = async (product, delta) => {
    const newPrice = Math.max(1, product.price + delta);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice } : p));
    setSavingPrice(prev => ({ ...prev, [product.id]: true }));
    try {
      await updateProduct(product.id, { ...product, price: newPrice });
      setSavedPrice(prev => ({ ...prev, [product.id]: true }));
      showToast(`${product.name} → ${formatPrice(newPrice)}`);
      setTimeout(() => setSavedPrice(prev => ({ ...prev, [product.id]: false })), 1500);
    } catch (err) {
      // Rollback on failure
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: product.price } : p));
      showToast('Failed to update price', 'error');
    } finally {
      setSavingPrice(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('chicken');
    setPrice('');
    setWeight('');
    setDescription('');
    setImage('chicken-product.png');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setWeight(product.weight);
    setDescription(product.description || '');
    setImage(product.image || 'chicken-product.png');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const productData = { name, category, price: parseFloat(price), weight, description, image, inStock: true };
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast('Product updated!');
      } else {
        await createProduct(productData);
        showToast('Product added!');
      }
      setIsModalOpen(false);
      await fetchAllProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left relative">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-dark text-white'
        }`}>
          {toast.type !== 'error' && <FaCheck className="text-green-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-dark">Manage Catalog</h2>
          <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Add, edit, or update prices instantly</p>
        </div>
        <Button onClick={openAddModal} size="sm" className="flex gap-1.5 py-2 px-3 text-xs">
          <FaPlus /> Add Item
        </Button>
      </div>

      {/* Price Step Selector */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-neutral-border shadow-xs">
        <span className="text-[10px] font-bold text-neutral-dark/50 uppercase tracking-wider whitespace-nowrap">Price Step:</span>
        <div className="flex gap-1.5">
          {PRICE_STEPS.map(step => (
            <button
              key={step}
              onClick={() => setPriceStep(step)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all duration-200 ${
                priceStep === step
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-neutral-light text-neutral-dark border-neutral-border hover:border-primary/40'
              }`}
            >
              ₹{step}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-neutral-dark/40 font-semibold ml-1">per tap</span>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-2.5">
          {products.map((p) => {
            const isSaving = savingPrice[p.id];
            const justSaved = savedPrice[p.id];
            return (
              <div
                key={p.id}
                className={`bg-white p-3 rounded-2xl border flex gap-3 items-center shadow-xs transition-all duration-300 ${
                  justSaved ? 'border-green-400 bg-green-50/30 shadow-green-100' : 'border-neutral-border'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-neutral-light rounded-xl overflow-hidden flex items-center justify-center p-1 border border-neutral-border/40 flex-shrink-0">
                  <img
                    src={p.image.startsWith('data:') || p.image.startsWith('http') ? p.image : new URL(`../assets/images/${p.image}`, import.meta.url).href}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100'; }}
                  />
                </div>

                {/* Info + Inline Price Control */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-neutral-dark truncate leading-tight">{p.name}</h4>
                  <span className="text-[9px] text-neutral-dark/50 uppercase font-bold tracking-wider">{p.category} • {p.weight}</span>

                  {/* Price Adjuster Row */}
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Decrease */}
                    <button
                      onClick={() => handleQuickPrice(p, -priceStep)}
                      disabled={isSaving || p.price <= 1}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 text-primary flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-xs"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>

                    {/* Price Display */}
                    <span className={`text-sm font-extrabold min-w-[56px] text-center leading-none transition-all duration-300 ${
                      justSaved ? 'text-green-600 scale-110' : 'text-neutral-dark'
                    } ${isSaving ? 'opacity-40' : ''}`}>
                      {isSaving ? '···' : formatPrice(p.price)}
                    </span>

                    {/* Increase */}
                    <button
                      onClick={() => handleQuickPrice(p, +priceStep)}
                      disabled={isSaving}
                      className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 text-green-700 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-xs"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>

                    {justSaved && (
                      <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5">
                        <FaCheck className="text-[8px]" /> Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit / Delete Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 bg-neutral-light hover:bg-neutral-border/40 text-neutral-dark/70 rounded-xl transition-all"
                  >
                    <FaEdit className="text-[11px]" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-red-50 hover:bg-primary-light text-primary rounded-xl transition-all"
                  >
                    <FaTrash className="text-[11px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Item' : 'Add New Item'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={true}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-neutral-dark opacity-85">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-neutral-light transition-all outline-none focus:border-primary focus:bg-white text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Price field with +/- steppers */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-neutral-dark opacity-85">Price (INR)</label>
              <div className="flex items-center border border-neutral-border rounded-xl overflow-hidden bg-neutral-light">
                <button
                  type="button"
                  onClick={() => setPrice(v => String(Math.max(1, parseFloat(v || 0) - 1)))}
                  className="px-2.5 py-3 bg-red-50 text-primary hover:bg-red-100 border-r border-neutral-border transition-all"
                >
                  <FaMinus className="text-[10px]" />
                </button>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="1"
                  className="flex-1 px-1 py-3 bg-white text-center text-sm font-extrabold outline-none text-neutral-dark min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setPrice(v => String(parseFloat(v || 0) + 1))}
                  className="px-2.5 py-3 bg-green-50 text-green-700 hover:bg-green-100 border-l border-neutral-border transition-all"
                >
                  <FaPlus className="text-[10px]" />
                </button>
              </div>
            </div>

            <Input
              label="Weight / Size"
              placeholder="e.g. 500g, 1kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-neutral-dark opacity-85">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-neutral-light transition-all outline-none focus:border-primary focus:bg-white text-sm"
              placeholder="Provide clean product info..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-sm font-semibold text-neutral-dark opacity-85">Product Image</label>
            <div className="flex gap-3 items-center mt-1">
              <div className="w-14 h-14 bg-neutral-light border border-neutral-border rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
                <img
                  src={image && (image.startsWith('data:') || image.startsWith('http')) ? image : (image ? new URL(`../assets/images/${image}`, import.meta.url).href : '')}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100'; }}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-neutral-dark opacity-75 font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80"
              />
            </div>
            {uploadingImage && (
              <span className="text-[10px] text-primary font-bold animate-pulse mt-1">Uploading image...</span>
            )}
          </div>

          <Button type="submit" loading={submitting || uploadingImage} className="w-full mt-2">
            Save Product
          </Button>
        </form>
      </Modal>
    </div>
  );
};
export default Products;
