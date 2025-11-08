import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Listing {
  id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  userId: string;
}

interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>([]);

  const addListing = (listing: Omit<Listing, 'id'>) => {
    const newListing = { ...listing, id: Date.now().toString() };
    setListings([newListing, ...listings]);
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
