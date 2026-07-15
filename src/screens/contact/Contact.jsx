import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { CallIcon, NotificationIcon, SearchIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';
import Contacts from 'react-native-contacts';

const { width } = Dimensions.get('window');

const ContactItem = ({ item }) => {
  const initials = item.name ? item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <TouchableOpacity style={styles.contactContainer}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: `file://${item.avatar}` }} style={styles.avatar} />
        ) : (
          <View style={styles.initialAvatar}>
            <Text style={styles.initialText}>{initials || '?'}</Text>
          </View>
        )}
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactSubtitle}>{item.phoneNumbers && item.phoneNumbers[0] ? item.phoneNumbers[0].number : ''}</Text>
      </View>

      <TouchableOpacity style={styles.callButton}>
        <CallIcon fill="#006E1C" width={20} height={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const Contact = () => {
  const [index, setIndex] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'favorites', title: 'Favorites' },
  ]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (Platform.OS === 'android') {
          const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
          if (!hasPermission) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
              {
                title: 'Contacts Permission',
                message: 'This app needs access to your contacts to display them.',
                buttonPositive: 'OK',
              }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              return;
            }
          }
        }
        const deviceContacts = await Contacts.getAll();
        const formattedContacts = deviceContacts.map((contact, idx) => ({
          id: contact.recordID || String(idx),
          recordID: contact.recordID,
          name: contact.givenName && contact.familyName
            ? `${contact.givenName} ${contact.familyName}`
            : contact.givenName || contact.familyName || 'Unknown',
          avatar: contact.hasThumbnail ? contact.thumbnailPath : null,
          phoneNumbers: contact.phoneNumbers,
          isFavorite: contact.isFavorite || false,
        }));
        setContacts(formattedContacts);
        setFavorites(formattedContacts.filter(c => c.isFavorite));
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };
    loadContacts();
  }, []);

  const AllRoute = () => (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ContactItem item={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No contacts found</Text>}
    />
  );

  const FavoritesRoute = () => (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ContactItem item={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No favorite contacts</Text>}
    />
  );

  const renderScene = SceneMap({
    all: AllRoute,
    favorites: FavoritesRoute,
  });

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#StatusBar" /> */}

      {/* Header */}
      <Header
        title="Contacts"
        titleStyle={{ color: '#151C27', textAlign: 'center' }}
        containerStyle={{ marginTop: 20 }}
        leftComponent={
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            style={styles.headerAvatar}
          />
        }
        rightComponent={<NotificationIcon />}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchIcon style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#888"
        />
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'transparent', height: 3 }}
            style={{
              backgroundColor: '#F4FBF1CC',
              elevation: 0,      // Android shadow remove
              shadowOpacity: 0,  // iOS shadow remove
              borderBottomWidth: 0,
              borderTopWidth: 0,
            }}
            activeColor="#4CAF50"
            inactiveColor="#888"
            labelStyle={{ fontWeight: '600', textTransform: 'none' }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF1CC',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FBF1CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingBottom: 70,
    paddingHorizontal: 10,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  initialAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default Contact;