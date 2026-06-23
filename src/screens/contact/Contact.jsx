import React, { useState } from 'react';
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
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { CallIcon, NotificationIcon, SearchIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

const contacts = [
  {
    id: '1',
    name: 'Alice Anderson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    subtitle: 'SIP: alice.a@softphone.corp',
    online: true,
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Arthur Wright',
    avatar: null,
    subtitle: '+1 (555) 123-4567',
    online: false,
    initial: 'AW',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Bob Baker',
    avatar: 'https://i.pravatar.cc/150?img=3',
    subtitle: 'SIP: bbaker@softphone.corp',
    online: true,
    isFavorite: true,
  },
  {
    id: '4',
    name: 'Catherine Davis',
    avatar: null,
    subtitle: '+40 20 7946 0958',
    online: false,
    initial: 'CD',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Charlie Chaplin (IT)',
    avatar: 'https://i.pravatar.cc/150?img=5',
    subtitle: 'SIP: helpdesk@softphone.corp',
    online: true,
    isFavorite: false,
  },
];

const favorites = contacts.filter(item => item.isFavorite);

const ContactItem = ({ item }) => (
  <TouchableOpacity style={styles.contactContainer}>
    <View style={styles.avatarContainer}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.initialAvatar}>
          <Text style={styles.initialText}>{item.initial}</Text>
        </View>
      )}
      {item.online && <View style={styles.onlineDot} />}
    </View>

    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
    </View>

    <TouchableOpacity style={styles.callButton}>
      <CallIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

const Contact = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'favorites', title: 'Favorites' },
  ]);

  const AllRoute = () => (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ContactItem item={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );

  const FavoritesRoute = () => (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ContactItem item={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderScene = SceneMap({
    all: AllRoute,
    favorites: FavoritesRoute,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
            indicatorStyle={{ backgroundColor: '#B61723', height: 3 }}
            style={{ backgroundColor: '#fff' }}
            activeColor="#B61723"
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
    backgroundColor: '#fff',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
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
});

export default Contact;