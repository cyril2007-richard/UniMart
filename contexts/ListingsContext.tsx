// contexts/ListingsContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  userId: string;
  sellerId: string;
  category: string;
  subcategory: string;
}

interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  loading: boolean;
  refreshListings: () => Promise<void>;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const listingsCollection = collection(db, 'listings');
      const listingsSnapshot = await getDocs(listingsCollection);
      const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching listings: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const refreshListings = async () => {
    setLoading(true);
    await fetchListings();
  };

  const addListing = async (listing: Omit<Listing, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      setListings(prev => [{ ...listing, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error("Error adding listing: ", error);
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const listingDocRef = doc(db, 'listings', listingId);
      // Delete reviews subcollection
      const reviewsCollectionRef = collection(db, 'listings', listingId, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollectionRef);
      const batch = writeBatch(db);
      reviewsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the listing document
      await deleteDoc(listingDocRef);

      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error("Error deleting listing: ", error);
    }
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, deleteListing, loading, refreshListings }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};