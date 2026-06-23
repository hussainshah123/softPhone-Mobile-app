import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Header from '../../components/Header';
import { FilterIcon, NotificationIcon } from '../../utils/svgs/CommonSvgs';

const { width } = Dimensions.get('window');

// Sample Data for each tab
const allCalls = [
  { id: '1', name: 'Alex Mercer', subtitle: 'Mobile • +1 (555) 019-2834', time: 'Today, 10:42 AM', type: 'missed', icon: '↓', iconColor: '#ff3b5c' },
  { id: '2', name: 'Design Sync', subtitle: 'Conference • Extension 402', time: 'Yesterday, 4:15 PM', type: 'outgoing', icon: '↑', iconColor: '#22c55e' },
  { id: '3', name: 'Sarah Chen', subtitle: 'Work • +1 (555) 837-1102', time: 'Yesterday, 1:30 PM', type: 'incoming', icon: '↖', iconColor: '#8b5cf6' },
  { id: '4', name: 'Unknown Caller', subtitle: 'Unknown • +1 (800) 555-0000', time: 'Mon, 9:00 AM', type: 'missed', icon: '↓', iconColor: '#ff3b5c' },
];

const missedCalls = allCalls.filter(item => item.type === 'missed');
const incomingCalls = allCalls.filter(item => item.type === 'incoming');
const outgoingCalls = allCalls.filter(item => item.type === 'outgoing');

const renderCallItem = ({ item }) => (
  <View style={styles.callCard}>
    <View style={styles.callInfo}>
      <View style={[styles.callIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
        <Text style={[styles.callTypeIcon, { color: item.iconColor }]}>{item.icon}</Text>
      </View>

      <View style={styles.callDetails}>
        <Text style={styles.callName}>{item.name}</Text>
        <Text style={styles.callSubtitle}>{item.subtitle}</Text>
        <Text style={styles.callTime}>{item.time}</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.callButton}>
      <Text style={styles.callButtonIcon}>📞</Text>
    </TouchableOpacity>
  </View>
);

const AllRoute = () => (
  <FlatList
    data={allCalls}
    keyExtractor={(item) => item.id}
    renderItem={renderCallItem}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
  />
);

const MissedRoute = () => (
  <FlatList
    data={missedCalls}
    keyExtractor={(item) => item.id}
    renderItem={renderCallItem}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
  />
);

const IncomingRoute = () => (
  <FlatList
    data={incomingCalls}
    keyExtractor={(item) => item.id}
    renderItem={renderCallItem}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
  />
);

const OutgoingRoute = () => (
  <FlatList
    data={outgoingCalls}
    keyExtractor={(item) => item.id}
    renderItem={renderCallItem}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.listContent}
  />
);

const renderScene = SceneMap({
  all: AllRoute,
  missed: MissedRoute,
  incoming: IncomingRoute,
  outgoing: OutgoingRoute,
});

const RecentCallHistory = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'missed', title: 'Missed' },
    { key: 'incoming', title: 'Incoming' },
    { key: 'outgoing', title: 'Outgoing' },
  ]);

  return (
    <View style={styles.container}>
      <Header
        title="Softphone"
        titleStyle={{ color: '#B61723', textAlign: 'center' }}
        containerStyle={{ marginTop: 20 }}
        leftComponent={
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            style={styles.headerAvatar}
          />
        }
        rightComponent={<NotificationIcon />}
      />

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Recent Calls</Text>
        <TouchableOpacity>
          <View style={styles.filterIcon}>
            <FilterIcon />
          </View>
        </TouchableOpacity>
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
            indicatorStyle={{ backgroundColor: '#ff3b5c', height: 3 }}
            style={{ backgroundColor: '#fff', elevation: 0 }}
            activeColor="#ff3b5c"
            inactiveColor="#888"
            labelStyle={{ fontWeight: '600', textTransform: 'none' }}
            tabStyle={{ paddingBottom: 4 }}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
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
    backgroundColor: '#fff',
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
    fontWeight: '600',
  },
  callSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  callTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
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
});

export default RecentCallHistory;