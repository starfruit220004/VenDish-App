import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Food {
  id: number;
  name: string;
  description: string;
  image: any;
  rating: number;
  category: string;
}

interface FavoritesContextType {
  favorites: Food[];
  addFavorite: (food: Food) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Food[]>([]);

  const addFavorite = (food: Food) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.id === food.id)) return prev;
      return [...prev, food];
    });
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}