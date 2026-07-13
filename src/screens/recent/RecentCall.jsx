import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ComposeIcon, MicIcon, SearchIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const allMessages = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar: 'https://i.pravatar.cc/150?img=1',
    message: 'Can you send over the final Q3 report? We need to review it before the call.',
    time: '10:42 AM',
    unread: true,
  },
  {
    id: '2',
    name: 'Michael Torres',
    avatar: 'https://i.pravatar.cc/150?img=2',
    message: "Sounds good. I'll see you at the office tomorrow morning.",
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '3',
    name: 'David Chen',
    avatar: 'https://i.pravatar.cc/150?img=3',
    message: 'The client approved the initial designs. Let\'s proceed with phase 2.',
    time: 'Tuesday',
    unread: false,
  },
  {
    id: '4',
    name: 'Elena Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=4',
    message: 'Hey! Just checking in on the status of the new feature deployment.',
    time: 'Monday',
    unread: true,
  },
  {
    id: '5',
    name: 'Marketing Team',
    avatar: 'https://i.pravatar.cc/150?img=5',
    message: 'Weekly update: Campaign performance is up by 15% across all major channels.',
    time: 'Oct 12',
    unread: false,
  },
];

const unreadMessages = allMessages.filter(item => item.unread);

const MessageItem = ({ item, navigation }) => (
  <TouchableOpacity 
    style={styles.messageContainer} 
    onPress={() => navigation.navigate('VoiceMail', { item })}
  >
    <View style={styles.avatarContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      {item.unread && <View style={styles.unreadDot} />}
    </View>

    <View style={styles.messageContent}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
    </View>
  </TouchableOpacity>
);

const RecentCall = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'unread', title: 'Unread' },
  ]);

  const AllRoute = () => (
    <FlatList
      data={allMessages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem item={item} navigation={navigation} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );

  const UnreadRoute = () => (
    <FlatList
      data={unreadMessages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem item={item} navigation={navigation} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderScene = SceneMap({
    all: AllRoute,
    unread: UnreadRoute,
  });

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}

      {/* <Header
        title="Phone"
        titleStyle={{ color: '#B61723' }}
        containerStyle={{ marginTop: 20 }}
        leftComponent={
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            style={styles.headerAvatar}
          />
        }
        rightComponent={<MicIcon />}
      /> */}

      <View style={styles.messagesHeader}>
        <Text style={styles.messagesTitle}>Messages</Text>
        <TouchableOpacity>
          <SearchIcon />
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'transparent', height: 3 }}
            style={{ backgroundColor: '#fff' }}
            activeColor="#006E1C"
            inactiveColor="#888"
            labelStyle={{ fontWeight: '600', textTransform: 'none' }}
          />
        )}
      />

      <TouchableOpacity style={styles.composeButton}>
        <ComposeIcon />
      </TouchableOpacity>
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
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messagesTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  unreadDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#006E1C',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  message: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
  },
  composeButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#006E1C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default RecentCall;