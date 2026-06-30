import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { app, db, isMockFirebase } from './firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { MOCK_PRODUCTS, CATEGORIES } from '../utils/constants';

// Helper to keep compatibility (in Firestore we store camelCase directly, so no-op)
export const toSnake = (obj) => obj;
export const toCamel = (obj) => obj;

// Initialize mock collections in localStorage if they don't exist
if (isMockFirebase) {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([
      { uid: 'mock_admin', email: 'admin@wfoods.com', fullName: 'System Admin', phone: '9876543210', role: 'admin' },
      { uid: 'mock_rider', email: 'rider@wfoods.com', fullName: 'Super Rider', phone: '9876543211', role: 'rider' },
      { uid: 'mock_customer', email: 'customer@wfoods.com', fullName: 'Happy Customer', phone: '9876543212', role: 'customer' }
    ]));
  }
  // Always update mock products and categories in development to capture additions
  localStorage.setItem('mock_products', JSON.stringify(MOCK_PRODUCTS));
  localStorage.setItem('mock_categories', JSON.stringify(CATEGORIES));
  if (!localStorage.getItem('mock_orders')) {
    localStorage.setItem('mock_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_addresses')) {
    localStorage.setItem('mock_addresses', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_riders')) {
    localStorage.setItem('mock_riders', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_tracking')) {
    localStorage.setItem('mock_tracking', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_notifications')) {
    localStorage.setItem('mock_notifications', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_medicine_orders')) {
    localStorage.setItem('mock_medicine_orders', JSON.stringify([]));
  }
}

// ---------------- USERS CRUD ----------------
export const getUserProfileDb = async (uid) => {
  if (isMockFirebase) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.find(u => u.uid === uid) || null;
  } else {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;
      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
};

export const getUsersDb = async () => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem('mock_users') || '[]');
  } else {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }
};

export const createUserProfileDb = async (uid, profileData) => {
  const profile = { uid, ...profileData, createdAt: new Date().toISOString() };
  if (isMockFirebase) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    users.push(profile);
    localStorage.setItem('mock_users', JSON.stringify(users));
    return profile;
  } else {
    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  }
};

// ---------------- SUPER ADMIN: USER MANAGEMENT ----------------
export const updateUserRoleDb = async (uid, newRole) => {
  if (isMockFirebase) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx].role = newRole;
      localStorage.setItem('mock_users', JSON.stringify(users));
    }
    window.dispatchEvent(new Event('storage'));
    return true;
  } else {
    await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: new Date().toISOString() });
    return true;
  }
};

export const deleteUserDb = async (uid) => {
  if (isMockFirebase) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const filtered = users.filter(u => u.uid !== uid);
    localStorage.setItem('mock_users', JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));
    return true;
  } else {
    await deleteDoc(doc(db, 'users', uid));
    return true;
  }
};

export const createAdminUserDb = async ({ email, password, fullName, phone, role = 'admin' }) => {
  if (isMockFirebase) {
    const uid = (role === 'rider' ? 'rider_' : 'admin_') + Math.random().toString(36).substr(2, 9);
    const profile = { uid, email, fullName, phone, role, createdAt: new Date().toISOString() };
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    users.push(profile);
    localStorage.setItem('mock_users', JSON.stringify(users));
    window.dispatchEvent(new Event('storage'));
    return profile;
  } else {
    // Create Firebase Auth user via secondary app to avoid logging out current user
    let authUid;
    try {
      const tempAppName = `tempApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const tempApp = initializeApp(app.options, tempAppName);
      const tempAuth = getAuth(tempApp);
      try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        authUid = userCredential.user.uid;
      } finally {
        await tempApp.delete();
      }
    } catch (authError) {
      throw new Error(`Failed to create auth account: ${authError.message}`);
    }

    const profile = {
      uid: authUid,
      email,
      fullName,
      phone,
      role,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', authUid), profile);
    return profile;
  }
};

// ---------------- SUPER ADMIN: STORE CONFIG ----------------
export const getStoreConfigDb = async () => {
  if (isMockFirebase) {
    const config = localStorage.getItem('mock_store_config');
    return config ? JSON.parse(config) : { minOrder: 150, deliveryFee: 30, storeStatus: 'open', deliveryRadius: 15, maintenanceMode: false };
  } else {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'store'));
      if (!configDoc.exists()) {
        return { minOrder: 150, deliveryFee: 30, storeStatus: 'open', deliveryRadius: 15, maintenanceMode: false };
      }
      return configDoc.data();
    } catch (error) {
      console.error('Error fetching store config:', error);
      return { minOrder: 150, deliveryFee: 30, storeStatus: 'open', deliveryRadius: 15, maintenanceMode: false };
    }
  }
};

export const saveStoreConfigDb = async (config) => {
  if (isMockFirebase) {
    localStorage.setItem('mock_store_config', JSON.stringify(config));
    return true;
  } else {
    await setDoc(doc(db, 'config', 'store'), { ...config, updatedAt: new Date().toISOString() });
    return true;
  }
};

// ---------------- PRODUCTS CRUD ----------------
export const getProductsDb = async () => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem('mock_products') || '[]');
  } else {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  }
};

export const getProductByIdDb = async (id) => {
  if (isMockFirebase) {
    const products = JSON.parse(localStorage.getItem('mock_products') || '[]');
    return products.find(p => p.id === id) || null;
  } else {
    const productDoc = await getDoc(doc(db, 'products', id));
    if (!productDoc.exists()) return null;
    return { id: productDoc.id, ...productDoc.data() };
  }
};

export const createProductDb = async (productData) => {
  const id = productData.id || 'p_' + Math.random().toString(36).substr(2, 9);
  const newProduct = {
    id,
    ...productData,
    rating: productData.rating || 5.0
  };

  if (isMockFirebase) {
    const products = JSON.parse(localStorage.getItem('mock_products') || '[]');
    products.push(newProduct);
    localStorage.setItem('mock_products', JSON.stringify(products));
    return newProduct;
  } else {
    await setDoc(doc(db, 'products', id), newProduct);
    return newProduct;
  }
};

export const updateProductDb = async (id, updatedData) => {
  if (isMockFirebase) {
    const products = JSON.parse(localStorage.getItem('mock_products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedData };
      localStorage.setItem('mock_products', JSON.stringify(products));
      return products[index];
    }
    throw new Error('Product not found.');
  } else {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, updatedData);
    return { id, ...updatedData };
  }
};

export const deleteProductDb = async (id) => {
  if (isMockFirebase) {
    const products = JSON.parse(localStorage.getItem('mock_products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('mock_products', JSON.stringify(filtered));
    return true;
  } else {
    await deleteDoc(doc(db, 'products', id));
    return true;
  }
};

// ---------------- CATEGORIES CRUD ----------------
export const getCategoriesDb = async () => {
  if (isMockFirebase) {
    return JSON.parse(localStorage.getItem('mock_categories') || '[]');
  } else {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  }
};

// ---------------- ORDERS CRUD ----------------
export const getOrdersDb = async () => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem('mock_orders') || '[]');
  } else {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }
};

export const createOrderDb = async (orderData) => {
  const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
  const orderId = orderData.id || 'ord_' + Math.random().toString(36).substr(2, 9);
  const newOrder = {
    id: orderId,
    ...orderData,
    deliveryPin,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
    return newOrder;
  } else {
    await setDoc(doc(db, 'orders', orderId), newOrder);
    return newOrder;
  }
};

export const updateOrderStatusDb = async (id, status, riderId = null) => {
  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      if (riderId) {
        orders[index].riderId = riderId;
        // Look up rider profile for name & phone
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const rider = users.find(u => u.uid === riderId);
        if (rider) {
          orders[index].riderName = rider.fullName || 'Delivery Partner';
          orders[index].riderPhone = rider.phone || '';
        }
      }
      localStorage.setItem('mock_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('storage'));
      return orders[index];
    }
    throw new Error('Order not found.');
  } else {
    const orderRef = doc(db, 'orders', id);
    const updates = { status };
    if (riderId) {
      updates.riderId = riderId;
      // Fetch rider profile from Firestore to save name & phone on order
      try {
        const riderDoc = await getDoc(doc(db, 'users', riderId));
        if (riderDoc.exists()) {
          const riderData = riderDoc.data();
          updates.riderName = riderData.fullName || 'Delivery Partner';
          updates.riderPhone = riderData.phone || '';
        }
      } catch (e) {
        console.error('Could not fetch rider profile:', e);
      }
    }
    await updateDoc(orderRef, updates);
    return updates;
  }
};

export const updateOrderFieldsDb = async (id, fields) => {
  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...fields };
      localStorage.setItem('mock_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('storage'));
      return orders[index];
    }
    throw new Error('Order not found.');
  } else {
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, fields);
    return fields;
  }
};

// ---------------- ADDRESSES CRUD ----------------
export const saveAddressDb = async (userId, addressData) => {
  if (isMockFirebase) {
    const key = `addresses_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const isEdit = existing.some(a => a.id === addressData.id);
    let updated;
    if (isEdit) {
      updated = existing.map(a => a.id === addressData.id ? addressData : a);
    } else {
      updated = [...existing, addressData];
    }
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return addressData;
  } else {
    const id = addressData.id || ('addr_' + Math.random().toString(36).substr(2, 9));
    const fullAddress = { ...addressData, id, userId, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'addresses', id), fullAddress);
    return fullAddress;
  }
};

export const getAddressesDb = async (userId) => {
  if (isMockFirebase) {
    const key = `addresses_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } else {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    return list;
  }
};

export const deleteAddressDb = async (addressId) => {
  if (isMockFirebase) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('addresses_')) {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = list.filter(a => a.id !== addressId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
    window.dispatchEvent(new Event('storage'));
    return true;
  } else {
    await deleteDoc(doc(db, 'addresses', addressId));
    return true;
  }
};

export const createRiderDb = async ({ fullName, phone, drivingLicense, aadharNumber, password }) => {
  const generatedUid = 'mock_rider_' + Math.random().toString(36).substr(2, 9);
  const generatedEmail = `rider_${phone}@wfoods.com`;
  const finalPassword = password || 'rider123';
  
  if (isMockFirebase) {
    // 1. Add to mock_users
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (users.some(u => u.phone === phone)) {
      throw new Error('A user with this mobile number already exists.');
    }
    const newUser = {
      uid: generatedUid,
      email: generatedEmail,
      fullName,
      phone,
      role: 'rider',
      password: finalPassword,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    // 2. Add to mock_riders
    const riders = JSON.parse(localStorage.getItem('mock_riders') || '[]');
    const newRider = {
      id: generatedUid,
      status: 'offline',
      currentLatitude: 17.9689,
      currentLongitude: 79.5941,
      drivingLicense,
      aadharNumber,
      updatedAt: new Date().toISOString()
    };
    riders.push(newRider);
    localStorage.setItem('mock_riders', JSON.stringify(riders));
    
    window.dispatchEvent(new Event('storage'));
    return { user: newUser, rider: newRider };
  } else {
    // Check if user already exists by phone
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('A user with this mobile number already exists.');
    }

    // Create Firebase Auth credentials using a secondary App instance to avoid logging out the Admin
    let authUid;
    try {
      const tempAppName = `tempApp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const tempApp = initializeApp(app.options, tempAppName);
      const tempAuth = getAuth(tempApp);
      
      try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, generatedEmail, finalPassword);
        authUid = userCredential.user.uid;
      } finally {
        await tempApp.delete();
      }
    } catch (authError) {
      console.error('Failed to create Firebase Auth user for rider:', authError);
      throw new Error(`Auth account creation failed: ${authError.message}`, { cause: authError });
    }

    const userProfile = {
      uid: authUid,
      email: generatedEmail,
      fullName,
      phone,
      role: 'rider',
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', authUid), userProfile);

    const riderProfile = {
      id: authUid,
      status: 'offline',
      currentLatitude: 17.9689,
      currentLongitude: 79.5941,
      drivingLicense,
      aadharNumber,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'riders', authUid), riderProfile);

    return { 
      user: userProfile, 
      rider: riderProfile 
    };
  }
};

// ---------------- RIDERS CRUD ----------------
export const getRidersDb = async () => {
  if (isMockFirebase) {
    return JSON.parse(localStorage.getItem('mock_riders') || '[]');
  } else {
    const querySnapshot = await getDocs(collection(db, 'riders'));
    const riders = [];
    querySnapshot.forEach((doc) => {
      riders.push({ id: doc.id, ...doc.data() });
    });
    return riders;
  }
};

export const getRiderStatusDb = async (riderId) => {
  if (isMockFirebase) {
    const riders = JSON.parse(localStorage.getItem('mock_riders') || '[]');
    let rider = riders.find(r => r.id === riderId);
    if (!rider) {
      rider = {
        id: riderId,
        status: 'offline',
        currentLatitude: 17.9689,
        currentLongitude: 79.5941,
        updatedAt: new Date().toISOString()
      };
      riders.push(rider);
      localStorage.setItem('mock_riders', JSON.stringify(riders));
    }
    return rider;
  } else {
    const riderDoc = await getDoc(doc(db, 'riders', riderId));
    if (!riderDoc.exists()) {
      const defaultRider = {
        id: riderId,
        status: 'offline',
        currentLatitude: 17.9689,
        currentLongitude: 79.5941,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'riders', riderId), defaultRider);
      return defaultRider;
    }
    return { id: riderDoc.id, ...riderDoc.data() };
  }
};

export const updateRiderStatusDb = async (riderId, status) => {
  if (isMockFirebase) {
    const riders = JSON.parse(localStorage.getItem('mock_riders') || '[]');
    const index = riders.findIndex(r => r.id === riderId);
    if (index !== -1) {
      riders[index].status = status;
      riders[index].updatedAt = new Date().toISOString();
      localStorage.setItem('mock_riders', JSON.stringify(riders));
      window.dispatchEvent(new Event('storage'));
      return riders[index];
    } else {
      const newRider = {
        id: riderId,
        status,
        currentLatitude: 17.9689,
        currentLongitude: 79.5941,
        updatedAt: new Date().toISOString()
      };
      riders.push(newRider);
      localStorage.setItem('mock_riders', JSON.stringify(riders));
      window.dispatchEvent(new Event('storage'));
      return newRider;
    }
  } else {
    const updates = { status, updatedAt: new Date().toISOString() };
    const riderRef = doc(db, 'riders', riderId);
    try {
      await updateDoc(riderRef, updates);
      return { id: riderId, ...updates };
    } catch {
      const rider = {
        id: riderId,
        status,
        currentLatitude: 17.9689,
        currentLongitude: 79.5941,
        updatedAt: new Date().toISOString()
      };
      await setDoc(riderRef, rider, { merge: true });
      return rider;
    }
  }
};

export const updateRiderLocationDb = async (riderId, lat, lng, status = 'idle') => {
  if (isMockFirebase) {
    const riders = JSON.parse(localStorage.getItem('mock_riders') || '[]');
    const index = riders.findIndex(r => r.id === riderId);
    const updatedRider = {
      id: riderId,
      status,
      currentLatitude: lat,
      currentLongitude: lng,
      updatedAt: new Date().toISOString()
    };
    if (index !== -1) {
      riders[index] = { ...riders[index], ...updatedRider };
    } else {
      riders.push(updatedRider);
    }
    localStorage.setItem('mock_riders', JSON.stringify(riders));
    window.dispatchEvent(new Event('storage'));
    return updatedRider;
  } else {
    const rider = {
      id: riderId,
      status,
      currentLatitude: lat,
      currentLongitude: lng,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'riders', riderId), rider, { merge: true });
    return rider;
  }
};

// ---------------- TRACKING CRUD ----------------
export const updateOrderTrackingDb = async (orderId, lat, lng, status) => {
  if (isMockFirebase) {
    const trackingList = JSON.parse(localStorage.getItem('mock_tracking') || '[]');
    const index = trackingList.findIndex(t => t.orderId === orderId);
    const update = {
      orderId,
      status,
      coordinates: { latitude: lat, longitude: lng },
      updatedAt: new Date().toISOString()
    };
    if (index !== -1) {
      trackingList[index] = update;
    } else {
      trackingList.push(update);
    }
    localStorage.setItem('mock_tracking', JSON.stringify(trackingList));
    window.dispatchEvent(new CustomEvent('mock_tracking_update', { detail: update }));
    window.dispatchEvent(new Event('storage'));
    return update;
  } else {
    const isMed = orderId.startsWith('med_');
    const orderDoc = await getDoc(doc(db, isMed ? 'medicine_orders' : 'orders', orderId));
    if (orderDoc.exists()) {
      const order = orderDoc.data();
      if (order.riderId) {
        await updateRiderLocationDb(
          order.riderId,
          lat,
          lng,
          status === 'delivered' ? 'idle' : 'delivering'
        );
      }
    }
    return { orderId, status, coordinates: { latitude: lat, longitude: lng } };
  }
};

export const subscribeToOrderTrackingDb = (orderId, callback) => {
  if (isMockFirebase) {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_tracking' || !e.key) {
        const trackingList = JSON.parse(localStorage.getItem('mock_tracking') || '[]');
        const trackDoc = trackingList.find(t => t.orderId === orderId);
        if (trackDoc) {
          callback(trackDoc);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleLocalUpdate = (e) => {
      if (e.detail?.orderId === orderId) {
        callback(e.detail);
      }
    };
    window.addEventListener('mock_tracking_update', handleLocalUpdate);

    // Initial load
    const trackingList = JSON.parse(localStorage.getItem('mock_tracking') || '[]');
    const trackDoc = trackingList.find(t => t.orderId === orderId);
    if (trackDoc) {
      callback(trackDoc);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_tracking_update', handleLocalUpdate);
    };
  } else {
    let unsubscribeRider = null;
    let isActive = true;
    const isMed = orderId.startsWith('med_');

    const unsubscribeOrder = onSnapshot(doc(db, isMed ? 'medicine_orders' : 'orders', orderId), async (snapshot) => {
      if (!isActive || !snapshot.exists()) return;
      const order = snapshot.data();
      if (order.riderId) {
        if (unsubscribeRider) unsubscribeRider();
        unsubscribeRider = onSnapshot(doc(db, 'riders', order.riderId), (riderSnapshot) => {
          if (!isActive || !riderSnapshot.exists()) return;
          const rider = riderSnapshot.data();
          callback({
            orderId,
            status: rider.status,
            coordinates: { latitude: rider.currentLatitude, longitude: rider.currentLongitude },
            updatedAt: rider.updatedAt
          });
        });
      }
    });

    return () => {
      isActive = false;
      unsubscribeOrder();
      if (unsubscribeRider) unsubscribeRider();
    };
  }
};

// ---------------- NOTIFICATIONS CRUD ----------------
export const getNotificationsDb = async (userId) => {
  if (isMockFirebase) {
    const notifs = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
    return notifs.filter(n => n.userId === userId);
  } else {
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notifs = [];
    querySnapshot.forEach((doc) => {
      notifs.push({ id: doc.id, ...doc.data() });
    });
    return notifs;
  }
};

export const createNotificationDb = async (userId, title, message) => {
  const notifId = 'notif_' + Math.random().toString(36).substr(2, 9);
  const newNotif = {
    id: notifId,
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (isMockFirebase) {
    const notifs = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
    notifs.push(newNotif);
    localStorage.setItem('mock_notifications', JSON.stringify(notifs));
    return newNotif;
  } else {
    await setDoc(doc(db, 'notifications', notifId), newNotif);
    return newNotif;
  }
};

export const markNotificationReadDb = async (notifId) => {
  if (isMockFirebase) {
    const notifs = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
    const index = notifs.findIndex(n => n.id === notifId);
    if (index !== -1) {
      notifs[index].read = true;
      localStorage.setItem('mock_notifications', JSON.stringify(notifs));
    }
  } else {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  }
};

export const subscribeToOrdersDb = (callback) => {
  if (isMockFirebase) {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_orders' || !e.key) {
        const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        callback(orders);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    callback(orders);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  } else {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      callback(orders);
    });
  }
};

// ---------------- MEDICINE ORDERS CRUD & REALTIME ----------------
export const createMedicineOrderDb = async (orderData) => {
  const orderId = orderData.id || 'med_' + Math.random().toString(36).substr(2, 9);
  const newOrder = {
    id: orderId,
    ...orderData,
    status: orderData.status || 'pending_review',
    createdAt: new Date().toISOString()
  };

  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('mock_medicine_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
    return newOrder;
  } else {
    await setDoc(doc(db, 'medicine_orders', orderId), newOrder);
    return newOrder;
  }
};

export const getMedicineOrdersDb = async () => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
  } else {
    const q = query(collection(db, 'medicine_orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }
};

export const updateMedicineOrderStatusDb = async (id, status, riderId = null) => {
  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      if (riderId) orders[index].riderId = riderId;
      orders[index].updatedAt = new Date().toISOString();
      localStorage.setItem('mock_medicine_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('storage'));
      return orders[index];
    }
    throw new Error('Medicine order not found.');
  } else {
    const orderRef = doc(db, 'medicine_orders', id);
    const updates = { status, updatedAt: new Date().toISOString() };
    if (riderId) updates.riderId = riderId;
    await updateDoc(orderRef, updates);
    return { id, ...updates };
  }
};

export const updateMedicineOrderFieldsDb = async (id, fields) => {
  if (isMockFirebase) {
    const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...fields, updatedAt: new Date().toISOString() };
      localStorage.setItem('mock_medicine_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('storage'));
      return orders[index];
    }
    throw new Error('Medicine order not found.');
  } else {
    const orderRef = doc(db, 'medicine_orders', id);
    const updates = { ...fields, updatedAt: new Date().toISOString() };
    await updateDoc(orderRef, updates);
    return updates;
  }
};

export const subscribeToMedicineOrdersDb = (callback) => {
  if (isMockFirebase) {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_medicine_orders' || !e.key) {
        const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(orders);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(orders);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  } else {
    const q = query(collection(db, 'medicine_orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      callback(orders);
    });
  }
};

export const subscribeToMedicineOrderByIdDb = (id, callback) => {
  if (isMockFirebase) {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_medicine_orders' || !e.key) {
        const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
        const order = orders.find(o => o.id === id);
        if (order) {
          callback(order);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    const orders = JSON.parse(localStorage.getItem('mock_medicine_orders') || '[]');
    const order = orders.find(o => o.id === id);
    if (order) {
      callback(order);
    }
    return () => window.removeEventListener('storage', handleStorageChange);
  } else {
    return onSnapshot(doc(db, 'medicine_orders', id), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });
  }
};

