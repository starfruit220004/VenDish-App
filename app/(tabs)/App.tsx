import React from 'react';
import MainDrawer from './MainDrawer';
import { FavoritesProvider } from './FavoritesContext';
import { ReviewsProvider } from './ReviewsContext';

export default function App() {
  return (
    <ReviewsProvider>
      <FavoritesProvider>
        <MainDrawer />
      </FavoritesProvider>
    </ReviewsProvider>
  );
}