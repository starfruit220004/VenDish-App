import React from 'react';
import MainDrawer from './MainDrawer';
import { FavoritesProvider } from './FavoritesContext';

export default function App() {
  return (
    <FavoritesProvider>
      <MainDrawer />
    </FavoritesProvider>
  );
}