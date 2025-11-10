// contexts/ListingsContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { products } from '../constants/mockData'; // ← ADD THIS

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
  addListing: (listing: Omit<Listing, 'id'>) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  // ← CONVERT products → Listing[]
  const initialListings: Listing[] = products.map(p => ({
    id: p.id,
    title: p.name,                    // ← map 'name' → 'title'
    price: p.price,
    description: p.description,
    images: [p.image],                // ← wrap image in array
    userId: p.sellerId,
    sellerId: p.sellerId,
    category: p.category,
    subcategory: p.subcategory,
  }));

  const [listings, setListings] = useState<Listing[]>(initialListings);

  const addListing = (listing: Omit<Listing, 'id'>) => {
    const newListing = { ...listing, id: Date.now().toString() };
    setListings(prev => [newListing, ...prev]);
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing }}>
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