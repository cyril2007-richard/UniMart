// contexts/CategoryContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import mockData from '../constants/mockData';

export interface Category {
  id: string;
  name: string;
  icon: string;
  priorityScore: number;
  tags: string[];
  subcategories: string[];
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        
        if (categoriesData.length > 0) {
          // Sort categories by priorityScore in descending order
          categoriesData.sort((a, b) => b.priorityScore - a.priorityScore);
          setCategories(categoriesData);
        } else {
          console.log("No categories found in DB, using mock data.");
          setCategories(mockData);
        }
      } catch (error) {
        console.error("Error fetching categories, using mock data: ", error);
        setCategories(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
