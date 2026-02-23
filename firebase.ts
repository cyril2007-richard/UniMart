import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// Change the import below:
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzE7Ph5t9uYCjhaNPg7KoImRIZlc8ALMg",
  authDomain: "unimart-76c50.firebaseapp.com",
  projectId: "unimart-76c50",
  storageBucket: "unimart-76c50.appspot.com",
  messagingSenderId: "291386337076",
  appId: "1:291386337076:web:e18169ba55839a9055e761",
  measurementId: "G-T9G1LYY0T7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with Persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
