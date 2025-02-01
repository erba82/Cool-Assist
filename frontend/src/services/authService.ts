// src/services/auth/authService.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const authService = {
  // Google Sign In
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Email Sign Up
  signUp: async (email: string, password: string, userData: any) => {
    try {
      // Password validation
      if (!isPasswordStrong(password)) {
        throw new Error('Password does not meet security requirements');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, userData);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Email Sign In
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Password strength checker
const isPasswordStrong = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar;
};

// User profile creation
const createUserProfile = async (userId: string, userData: any) => {
  try {
    await db.collection('users').doc(userId).set({
      ...userData,
      createdAt: new Date(),
      settings: {
        theme: 'light',
        notifications: true,
        units: 'metric'
      }
    });
  } catch (error) {
    throw new Error('Error creating user profile');
  }
};