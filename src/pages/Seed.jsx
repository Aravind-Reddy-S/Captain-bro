import React, { useState } from 'react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { MOCK_PRODUCTS, CATEGORIES } from '../utils/constants';

const Seed = () => {
  const [status, setStatus] = useState('Idle');
  const [loading, setLoading] = useState(false);

  const seedDatabase = async () => {
    setLoading(true);
    setStatus('Seeding... Do not close this tab.');
    try {
      const batch = writeBatch(db);

      // 1. Seed Categories
      for (const cat of CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), cat);
      }
      
      // 2. Seed Products
      for (const prod of MOCK_PRODUCTS) {
        batch.set(doc(db, 'products', String(prod.id)), prod);
      }

      await batch.commit();

      setStatus('Success! All products and categories have been uploaded to your real Firestore database.');
    } catch (e) {
      console.error(e);
      setStatus('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-neutral-light">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-black mb-2 text-neutral-dark">Database Seeder</h1>
        <p className="text-xs text-neutral-dark opacity-70 mb-6">
          This will upload all your mock products and categories into your new Firestore database.
        </p>
        
        <button 
          onClick={seedDatabase}
          disabled={loading}
          className={`w-full py-3 text-white font-bold rounded-lg transition-all ${loading ? 'bg-primary/50' : 'bg-primary hover:bg-primary-dark'}`}
        >
          {loading ? 'Uploading Data...' : 'Seed Database Now'}
        </button>
        
        <p className="mt-6 text-sm font-semibold">{status}</p>
      </div>
    </div>
  );
};

export default Seed;
