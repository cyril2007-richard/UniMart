import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
