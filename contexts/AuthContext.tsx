import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uploadImage } from '../lib/imageService';

type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  profilePicture: string;
  matricNumber?: string;
  faculty?: string;
  phoneNumber: string;
  followers: number;
  following: number;
  isVerified: boolean;
  favorites?: string[];
};

// --- FIX: Create a simpler, more accurate type for new user data ---
// This includes all User fields except the auto-generated ones, plus password
type SignUpData = Omit<User, 'id' | 'followers' | 'following' | 'isVerified'> & {
  password?: string; // Password is required for signup
  email: string; // Keep email as required for the signup function internally
};
// --- End of FIX ---

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  signup: (newUser: SignUpData) => Promise<boolean>; // <-- FIX: Use the new SignUpData type
  logout: () => Promise<void>;
  updateProfile: (userId: string, username: string, profilePictureUri?: string) => Promise<boolean>;
  setVerified: (userId: string, isVerified: boolean) => Promise<boolean>;
  toggleFavorite: (productId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('onAuthStateChanged fired:', firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          console.log('User doc exists:', userDoc.data());
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          console.log('User doc does not exist');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      let email = usernameOrEmail;
      
      // If input is not an email, assume it's a username and find the email
      if (!usernameOrEmail.includes('@')) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', usernameOrEmail));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
              console.error('Username not found');
              return false;
          }
          
          email = querySnapshot.docs[0].data().email;
        } catch (queryError: any) {
          if (queryError.code === 'permission-denied') {
            console.error('Permission denied searching for username. Use email instead.');
            // Fallback: If they entered a username but we can't query, 
            // we can't do much unless we have a specific 'usernames' mapping collection.
            return false;
          }
          throw queryError;
        }
      }

      await signInWithEmailAndPassword(auth, email, password); 
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // <-- FIX: Use the simplified SignUpData type
  const signup = async (newUser: SignUpData): Promise<boolean> => {
    try {
      if (!newUser.password) {
        throw new Error("Password is required for signup.");
      }

      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', newUser.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.error('Username already exists');
        return false;
      }

      // <-- FIX: Use imported createUserWithEmailAndPassword
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const firebaseUser = userCredential.user;

      const userToAdd = {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        matricNumber: newUser.matricNumber || '',
        faculty: newUser.faculty || '',
        phoneNumber: newUser.phoneNumber,
        followers: 0,
        following: 0,
        isVerified: false,
        favorites: [],
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userToAdd); // <-- FIX: Use imported setDoc and doc
      setCurrentUser({ id: firebaseUser.uid, ...userToAdd });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!currentUser) return;

    const isFavorited = currentUser.favorites?.includes(productId);
    const userDocRef = doc(db, 'users', currentUser.id);

    try {
      if (isFavorited) {
        await updateDoc(userDocRef, {
          favorites: arrayRemove(productId)
        });
        setCurrentUser(prev => prev ? {
          ...prev,
          favorites: prev.favorites?.filter(id => id !== productId)
        } : null);
      } else {
        await updateDoc(userDocRef, {
          favorites: arrayUnion(productId)
        });
        setCurrentUser(prev => prev ? {
          ...prev,
          favorites: [...(prev.favorites || []), productId]
        } : null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth); // <-- FIX: Use imported signOut
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userId: string, username: string, profilePictureUrl?: string): Promise<boolean> => {
    try {
      const userDocRef = doc(db, 'users', userId); // <-- FIX: Use imported doc
      
      const updateData: any = { username };
      if (profilePictureUrl) {
        updateData.profilePicture = profilePictureUrl;
      }

      await updateDoc(userDocRef, updateData);

      // Update currentUser state
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? {
          ...prev,
          username: username,
          profilePicture: profilePictureUrl || prev.profilePicture,
        } : null);
      }
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const setVerified = async (userId: string, isVerified: boolean): Promise<boolean> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isVerified: isVerified,
      });

      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, isVerified } : null);
      }
      return true;
    } catch (error) {
      console.error('Error setting verified status:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateProfile, setVerified, toggleFavorite }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};