// app/(tabs)/App.tsx
import React from 'react';
import MainDrawer from './MainDrawer';
import { FavoritesProvider } from './FavoritesContext';

// ✅ FIXED: Remove RootNavigator, use MainDrawer directly
export default function App() {
  return (
    <FavoritesProvider>
      <MainDrawer />
    </FavoritesProvider>
  );
}