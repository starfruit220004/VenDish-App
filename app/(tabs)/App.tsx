import React, { useEffect } from 'react';
import MainDrawer from './MainDrawer';
import { FavoritesProvider } from './FavoritesContext';
import { ReviewsProvider } from './ReviewsContext';
import { AuthProvider } from '../context/AuthContext';
import * as Linking from 'expo-linking';
import { createURL } from 'expo-linking';

export default function App() {
  

  useEffect(() => {
    const normalizeAndRoute = (rawUrl: string | null) => {
      if (!rawUrl) return;
      try {
        const parsed = Linking.parse(rawUrl as string) as any;
        let path = parsed.path || '';

        // If scheme itself is 'feed' with no path, route to Feed
        if ((parsed.scheme === 'feed' || parsed.scheme === 'feed.') && !path) {
          path = 'feed';
        }

        if (path) {
          const route = path.startsWith('/') ? path : `/${path}`;
          if (route === '/feed' || route.startsWith('/feed')) {
            // Open app root to ensure the main UI loads (avoids expo-router unmatched route)
            Linking.openURL(createURL('/'));
          }
        }
      } catch (e) {
        // ignore parsing errors
      }
    };

    (async () => {
      const initial = await Linking.getInitialURL();
      normalizeAndRoute(initial);
    })();

    const handler = (event: { url: string }) => normalizeAndRoute(event.url);
    const sub = Linking.addEventListener('url', handler as any);
    return () => {
      try { sub.remove && sub.remove(); } catch (e) {}
    };
  }, []);
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