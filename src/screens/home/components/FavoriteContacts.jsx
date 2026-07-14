import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import ContactCard from './ContactCard';
import { FavrateIcon } from '../../../utils/svgs/CommonSvgs';
import { getFavorites } from '../../../services/favoritesService';
import { useFocusEffect } from '@react-navigation/native';

const FavoriteContacts = ({ navigation, data }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favs = await getFavorites();
      console.log('[FavoriteContacts] Loaded favorites:', favs.length);
      setFavorites(favs);
    } catch (error) {
      console.error('[FavoriteContacts] Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Always use loaded data, ignore data prop when we have loaded favorites
  const displayData = favorites.length > 0 ? favorites : (data || []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorite Contacts</Text>
        </View>
        <ActivityIndicator size="small" color="#4CAF50" style={{ paddingVertical: 20 }} />
      </View>
    );
  }

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorite Contacts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
            <FavrateIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.emptyText}>No favorite contacts yet. Mark contacts as favorite in call history!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite Contacts</Text>

        <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
          <FavrateIcon />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id || item.number}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ContactCard item={item} />
        )}
      />
    </View>
  );
};

export default FavoriteContacts;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },

  seeAll: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED957',
  },

  row: {
    justifyContent: 'space-between',
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});