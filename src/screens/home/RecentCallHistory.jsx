import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Header from '../../components/Header';
import { FilterIcon, NotificationIcon } from '../../utils/svgs/CommonSvgs';
import { getCallHistory } from '../../services/callHistoryService';
import { saveFavorite, removeFavorite, isFavorite } from '../../services/favoritesService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { startCall, formatDuration } from '../../utils/callHelper';

const { width } = Dimensions.get('window');

const getCallIcon = (type) => {
  if (type === 'incoming') return { icon: '↖', iconColor: '#8b5cf6' }
  if (type === 'outgoing') return { icon: '↑', iconColor: '#22c55e' }
  return { icon: '↓', iconColor: '#ff3b5c' }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString([], { weekday: 'short' }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const RecentCallHistory = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [allCalls, setAllCalls] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'missed', title: 'Missed' },
    { key: 'incoming', title: 'Incoming' },
    { key: 'outgoing', title: 'Outgoing' },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        const history = await getCallHistory();
        console.log('[RecentCallHistory] Loaded history:', history.length, 'items');

        // Load favorites
        const favSet = new Set();
        for (const call of history) {
          const isFav = await isFavorite(call.number);
          if (isFav) {
            favSet.add(call.number);
          }
        }
        setFavorites(favSet);

        const formatted = history.map(call => ({
          id: call.id,
          number: call.number,
          name: call.name,
          subtitle: call.number,
          time: formatTime(call.timestamp || Date.now()),
          duration: call.duration || 0,
          type: call.type,
          ...getCallIcon(call.type)
        }));
        setAllCalls(formatted);
      };
      loadHistory();
    }, [])
  );

  const handleToggleFavorite = async (call) => {
    const newFavorites = new Set(favorites);

    if (newFavorites.has(call.number)) {
      // Remove from favorites
      await removeFavorite(call.number);
      newFavorites.delete(call.number);
      console.log('[RecentCallHistory] Removed from favorites:', call.number);
    } else {
      // Add to favorites
      const added = await saveFavorite({
        name: call.name,
        number: call.number,
      });
      if (added) {
        newFavorites.add(call.number);
        console.log('[RecentCallHistory] Added to favorites:', call.number);
      }
    }

    setFavorites(newFavorites);
  };

  const missedCalls = allCalls.filter(item => item.type === 'missed');
  const incomingCalls = allCalls.filter(item => item.type === 'incoming');
  const outgoingCalls = allCalls.filter(item => item.type === 'outgoing');

  const renderCallItem = ({ item }) => {
    const isFav = favorites.has(item.number);

    return (
      <View style={styles.callCard}>
        <View style={styles.callInfo}>
          <View style={[styles.callIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
            <Text style={[styles.callTypeIcon, { color: item.iconColor }]}>{item.icon}</Text>
          </View>

          <View style={styles.callDetails}>
            <Text style={styles.callName}>{item.name}</Text>
            <Text style={styles.callSubtitle}>{item.subtitle}</Text>
            <Text style={styles.callTime}>
              {item.time}
              {item.duration > 0 ? ` · ${formatDuration(item.duration)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Text style={styles.favoriteButtonIcon}>{isFav ? '⭐' : '☆'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => startCall(navigation, item.number, item.name)}
          >
            <Text style={styles.callButtonIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const AllRoute = () => (
    <FlatList
      data={allCalls}
      keyExtractor={(item) => item.id}
      renderItem={renderCallItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No call history</Text>}
    />
  );

  const MissedRoute = () => (
    <FlatList
      data={missedCalls}
      keyExtractor={(item) => item.id}
      renderItem={renderCallItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No missed calls</Text>}
    />
  );

  const IncomingRoute = () => (
    <FlatList
      data={incomingCalls}
      keyExtractor={(item) => item.id}
      renderItem={renderCallItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No incoming calls</Text>}
    />
  );

  const OutgoingRoute = () => (
    <FlatList
      data={outgoingCalls}
      keyExtractor={(item) => item.id}
      renderItem={renderCallItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No outgoing calls</Text>}
    />
  );

  const renderScene = SceneMap({
    all: AllRoute,
    missed: MissedRoute,
    incoming: IncomingRoute,
    outgoing: OutgoingRoute,
  });

  return (
    <View style={styles.container}>
      <Header
        title="Recent Calls history"
        titleStyle={{ color: 'white', textAlign: 'center' }}
        containerStyle={{ marginTop: 20 }}
        leftComponent={
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            style={styles.headerAvatar}
          />
        }
        rightComponent={<NotificationIcon fill="white" />}
      />

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Recent Calls</Text>
        {/* <TouchableOpacity>
          <View style={styles.filterIcon}>
            <FilterIcon />
          </View>
        </TouchableOpacity> */}
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
            indicatorStyle={{ backgroundColor: 'transparent' }}
            style={{
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            }}
            renderTabBarItem={({ route, navigationState, onPress }) => {
              const isActive =
                navigationState.routes[navigationState.index].key === route.key;

              return (
                <TouchableOpacity
                  onPress={onPress}
                  style={{
                    backgroundColor: isActive ? '#006E1C' : 'transparent',
                    // borderColor: '#006E1C',
                    // borderWidth: 1,
                    borderRadius: 25,
                    marginHorizontal: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: isActive ? '#fff' : '#fff',
                      fontWeight: '600',
                    }}>
                    {route.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
  },
  filterIcon: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  callInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  callTypeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  callDetails: {
    flex: 1,
  },
  callName: {
    fontSize: 17,
    color:'white',
    fontWeight: '600',
  },
  callSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 2,
  },
  callTime: {
    fontSize: 13,
    color: '#b9b5b5',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff9e6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  favoriteButtonIcon: {
    fontSize: 18,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonIcon: {
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default RecentCallHistory;