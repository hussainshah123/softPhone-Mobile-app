import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favoriteContacts';

export const saveFavorite = async (contact) => {
  try {
    const favorites = await getFavorites();

    // Check if already exists
    const exists = favorites.some(f => f.number === contact.number);
    if (exists) {
      console.log('[Favorites] Contact already favorited:', contact.number);
      return false;
    }

    const newFavorite = {
      id: contact.number,
      number: contact.number,
      name: contact.name,
      addedAt: Date.now(),
    };

    const updated = [newFavorite, ...favorites];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    console.log('[Favorites] Contact favorited:', newFavorite);
    return true;
  } catch (error) {
    console.error('[Favorites] Failed to save favorite:', error);
    return false;
  }
};

export const removeFavorite = async (number) => {
  try {
    const favorites = await getFavorites();
    const updated = favorites.filter(f => f.number !== number);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    console.log('[Favorites] Contact removed from favorites:', number);
    return true;
  } catch (error) {
    console.error('[Favorites] Failed to remove favorite:', error);
    return false;
  }
};

export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('[Favorites] Failed to load favorites:', error);
    return [];
  }
};

export const isFavorite = async (number) => {
  try {
    const favorites = await getFavorites();
    return favorites.some(f => f.number === number);
  } catch (error) {
    console.error('[Favorites] Failed to check favorite:', error);
    return false;
  }
};

export const clearFavorites = async () => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    console.log('[Favorites] All favorites cleared');
    return true;
  } catch (error) {
    console.error('[Favorites] Failed to clear favorites:', error);
    return false;
  }
};
