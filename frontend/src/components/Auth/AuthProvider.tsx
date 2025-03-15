import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleLogin: () => Promise<User>;
  linkedinLogin: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Email/password signup
// Define interface for user data stored in Firestore
interface UserData {
    name: string;
    email: string;
    createdAt: ReturnType<typeof serverTimestamp>;
    lastLogin: ReturnType<typeof serverTimestamp>;
}

const signup = async (email: string, password: string, name: string): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        const userData: UserData = {
            name,
            email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        return user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

  // Email/password login
const login = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Update last login time
        await setDoc(doc(db, "users", userCredential.user.uid), {
            lastLogin: serverTimestamp()
        }, { merge: true });
        
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

  // Google login
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update last login
        await setDoc(doc(db, "users", user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      return user;
    } catch (error) {
      console.error("Error with Google login:", error);
      throw error;
    }
  };

  // LinkedIn login (prepare the function, but needs LinkedIn API setup)
  const linkedinLogin = async () => {
    // This will be implemented when LinkedIn credentials are set up
    console.log("LinkedIn login functionality needs API setup");
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Password reset
const resetPassword = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
};

  // Update auth state when user logs in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    googleLogin,
    linkedinLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};