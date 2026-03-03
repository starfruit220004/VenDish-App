import React from 'react';
import MainDrawer from './MainDrawer';
import { FavoritesProvider } from './FavoritesContext';
import { ReviewsProvider } from './ReviewsContext';
import { AuthProvider } from '../context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <FavoritesProvider>
          <MainDrawer />
        </FavoritesProvider>
      </ReviewsProvider>
    </AuthProvider>
  );
}