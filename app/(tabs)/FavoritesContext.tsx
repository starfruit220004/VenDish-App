import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Food } from '../types';
import { useAuth } from '../context/AuthContext';

interface FavoritesContextType {
  favorites: Food[];
  addFavorite: (food: Food) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FAVORITES_STORAGE_PREFIX = 'favorite_foods';
const LOGGED_OUT_FAVORITES_STORAGE_KEY = `${FAVORITES_STORAGE_PREFIX}:logged_out_cache`;
const FALLBACK_FOOD_IMAGE = require('../../assets/images/Logo2.jpg');

const normalizeFavorite = (candidate: unknown): Food | null => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const raw = candidate as Partial<Food> & { image?: unknown };
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const servings = Number(raw.servings ?? 0);
  const image =
    typeof raw.image === 'number'
      ? raw.image
      : raw.image && typeof raw.image === 'object' && 'uri' in raw.image
      ? { uri: String((raw.image as { uri?: string }).uri ?? '') }
      : FALLBACK_FOOD_IMAGE;

  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    image,
    category: typeof raw.category === 'string' ? raw.category : 'Uncategorized',
    price: Number(raw.price ?? 0),
    servings,
    isAvailable: typeof raw.isAvailable === 'boolean' ? raw.isAvailable : servings > 0,
  };
};

const parseStoredFavorites = (storedValue: string | null): Food[] => {
  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const deduped: Food[] = [];
    const seenIds = new Set<number>();

    parsed.forEach((entry) => {
      const favorite = normalizeFavorite(entry);
      if (!favorite || seenIds.has(favorite.id)) {
        return;
      }

      seenIds.add(favorite.id);
      deduped.push(favorite);
    });

    return deduped;
  } catch (error) {
    console.error('Failed to parse stored favorites:', error);
    return [];
  }
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { isLoggedIn, isAuthLoading, userData } = useAuth();
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  const favoritesStorageKey = useMemo(() => {
    const username = userData?.username?.trim().toLowerCase();
    if (!isLoggedIn || !username) {
      return null;
    }

    return `${FAVORITES_STORAGE_PREFIX}:${username}`;
  }, [isLoggedIn, userData?.username]);

  const activeFavoritesStorageKey = useMemo(
    () => favoritesStorageKey ?? LOGGED_OUT_FAVORITES_STORAGE_KEY,
    [favoritesStorageKey]
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateFavorites = async () => {
      if (isAuthLoading) {
        return;
      }

      try {
        const rawFavorites = await AsyncStorage.getItem(activeFavoritesStorageKey);
        if (!isMounted) {
          return;
        }

        const storedFavorites = parseStoredFavorites(rawFavorites);
        setFavorites(storedFavorites);
      } catch (error) {
        console.error('Failed to load favorites from storage:', error);
        if (isMounted) {
          setFavorites([]);
        }
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };

    setHasHydrated(false);
    hydrateFavorites();

    return () => {
      isMounted = false;
    };
  }, [activeFavoritesStorageKey, isAuthLoading]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const serializedFavorites = JSON.stringify(favorites);
    const writeOperations = [
      AsyncStorage.setItem(LOGGED_OUT_FAVORITES_STORAGE_KEY, serializedFavorites),
    ];

    if (favoritesStorageKey) {
      writeOperations.push(AsyncStorage.setItem(favoritesStorageKey, serializedFavorites));
    }

    Promise.all(writeOperations).catch((error) => {
      console.error('Failed to save favorites to storage:', error);
    });
  }, [favorites, favoritesStorageKey, hasHydrated]);

  const addFavorite = useCallback((food: Food) => {
    if (!isLoggedIn) {
      return;
    }

    const normalizedFood = normalizeFavorite(food);
    if (!normalizedFood) {
      return;
    }

    setFavorites((prev) => {
      if (prev.find((f) => f.id === normalizedFood.id)) return prev;
      return [...prev, normalizedFood];
    });
  }, [isLoggedIn]);

  const removeFavorite = useCallback((id: number) => {
    if (!isLoggedIn) {
      return;
    }

    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, [isLoggedIn]);

  const isFavorite = useCallback((id: number) => favorites.some((f) => f.id === id), [favorites]);

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

export default FavoritesContext;