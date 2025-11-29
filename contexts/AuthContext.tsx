import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  matricNumber: string;
  faculty: string;
  phoneNumber: string;
  followers: number;
  following: number;
};

// --- FIX: Create a simpler, more accurate type for new user data ---
// This includes all User fields except the auto-generated ones, plus password
type SignUpData = Omit<User, 'id' | 'followers' | 'following'> & {
  password?: string; // Password is required for signup
};
// --- End of FIX ---

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  signup: (newUser: SignUpData) => Promise<boolean>; // <-- FIX: Use the new SignUpData type
  logout: () => Promise<void>;
  updateProfile: (userId: string, username: string, profilePictureUri?: string) => Promise<boolean>;
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
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', usernameOrEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error('Username not found');
            return false;
        }
        
        // Assuming usernames are unique, take the first match
        email = querySnapshot.docs[0].data().email;
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
        matricNumber: newUser.matricNumber,
        faculty: newUser.faculty,
        phoneNumber: newUser.phoneNumber,
        followers: 0,
        following: 0,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userToAdd); // <-- FIX: Use imported setDoc and doc
      setCurrentUser({ id: firebaseUser.uid, ...userToAdd });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth); // <-- FIX: Use imported signOut
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userId: string, username: string, profilePictureUri?: string): Promise<boolean> => {
    try {
      const userDocRef = doc(db, 'users', userId); // <-- FIX: Use imported doc
      let updatedProfilePictureUrl = profilePictureUri;

      if (profilePictureUri && profilePictureUri.startsWith('file://')) {
        // Upload new profile picture to Firebase Storage
        const response = await fetch(profilePictureUri);
        const blob = await response.blob();
        const storageRef = ref(getStorage(), `profilePictures/${userId}`);
        const uploadTask = await uploadBytes(storageRef, blob);
        updatedProfilePictureUrl = await getDownloadURL(uploadTask.ref);
      }

      await updateDoc(userDocRef, { // <-- FIX: Use imported updateDoc
        username: username,
        profilePicture: updatedProfilePictureUrl,
      });

      // Update currentUser state
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? {
          ...prev,
          username: username,
          profilePicture: updatedProfilePictureUrl || prev.profilePicture,
        } : null);
      }
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, updateProfile }}>
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