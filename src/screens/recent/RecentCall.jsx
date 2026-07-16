import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { SearchIcon } from '../../utils/svgs/CommonSvgs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getCallHistory } from '../../services/callHistoryService';
import { startCall, formatDuration } from '../../utils/callHelper';

const { width } = Dimensions.get('window');

const getCallIcon = (type) => {
  if (type === 'incoming') return { icon: '↙', iconColor: '#8b5cf6' };
  if (type === 'outgoing') return { icon: '↗', iconColor: '#22c55e' };
  return { icon: '↙', iconColor: '#ff3b5c' }; // missed
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString([], { weekday: 'short' })}, ${time}`;
};

const CallItem = ({ item, navigation }) => {
  const initials = (item.name || item.number || '?')
    .toString()
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const { icon, iconColor } = getCallIcon(item.type);

  return (
    <TouchableOpacity
      style={styles.callContainer}
      onPress={() => startCall(navigation, item.number, item.name)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.callContent}>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.number}</Text>
        <View style={styles.subRow}>
          <Text style={[styles.callType, { color: iconColor }]}>{icon}</Text>
          <Text style={styles.time} numberOfLines={1}>
            {formatTime(item.timestamp)}
            {item.duration > 0 ? ` · ${formatDuration(item.duration)}` : ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => startCall(navigation, item.number, item.name)}
      >
        <Text style={styles.callButtonIcon}>📞</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const EmptyState = ({ text }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const RecentCall = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [callHistory, setCallHistory] = useState([]);
  const [routes] = useState([
    { key: 'calls', title: 'Calls' },
    { key: 'messages', title: 'Messages' },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const loadHistory = async () => {
        const history = await getCallHistory();
        if (active) {
          setCallHistory(Array.isArray(history) ? history : []);
        }
      };
      loadHistory();
      return () => {
        active = false;
      };
    }, [])
  );

  const CallsRoute = () => (
    <FlatList
      data={callHistory}
      keyExtractor={(item, i) => item.id?.toString() || `${item.number}-${i}`}
      renderItem={({ item }) => <CallItem item={item} navigation={navigation} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyState text="No call history yet" />}
    />
  );

  const MessagesRoute = () => (
    <FlatList
      data={[]}
      keyExtractor={(item, i) => `${i}`}
      renderItem={null}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyState text="No messages yet" />}
    />
  );

  const renderScene = SceneMap({
    calls: CallsRoute,
    messages: MessagesRoute,
  });

  return (
    <View style={styles.container}>
      <View style={styles.messagesHeader}>
        <Text style={styles.messagesTitle}>History</Text>
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
            style={{
              backgroundColor: '#F4FBF1CC',
              elevation: 0,      // Android shadow remove
              shadowOpacity: 0,  // iOS shadow remove
              borderBottomWidth: 0,
              borderTopWidth: 0,
            }}
            activeColor="#006E1C"
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
    flexGrow: 1,
  },
  callContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 20,
    marginVertical: 6,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#006E1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  callContent: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  callType: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
  },
  time: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default RecentCall;
