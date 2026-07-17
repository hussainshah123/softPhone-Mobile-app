import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getCallHistory } from '../../../services/callHistoryService';
import { startCall } from '../../../utils/callHelper';

const RecentCalls = ({ navigation }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const history = await getCallHistory();
      console.log('[RecentCalls] Loaded call history:', history.length, 'calls');

      // Get unique contacts (first 6 unique phone numbers)
      const uniqueContacts = [];
      const seenNumbers = new Set();

      for (const call of history) {
        if (!seenNumbers.has(call.number) && uniqueContacts.length < 6) {
          seenNumbers.add(call.number);
          uniqueContacts.push({
            id: call.number,
            name: call.name || call.number,
            number: call.number,
            image: `https://i.pravatar.cc/150?u=${call.number}`,
          });
        }
      }

      console.log('[RecentCalls] Unique contacts:', uniqueContacts.length);
      setCallHistory(uniqueContacts);
    } catch (error) {
      console.error('[RecentCalls] Failed to load call history:', error);
      setCallHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Only show real call history; no dummy fallback
  const displayData = callHistory;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.title}>Recent Calls</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
            <Text style={styles.seeall}>See All</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="small" color="#4CAF50" style={{ paddingVertical: 20 }} />
      </View>
    );
  }

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.title}>Recent Calls</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
            <Text style={styles.seeall}>See All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.emptyText}>No recent calls</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Recent Calls</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
          <Text style={styles.seeall}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const initials = (item.name || item.number || '?')
            .split(' ')
            .slice(0, 2)
            .map(part => part[0])
            .join('')
            .toUpperCase();

          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => startCall(navigation, item.number, item.name)}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.initials}>{initials}</Text>
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default RecentCalls;

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  row: {
    flexDirection: "row",
    justifyContent: 'space-between'
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 15,
  },
  seeall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 15,
  },

  item: {
    alignItems: 'center',
    marginRight: 18,
  },

  avatarContainer: {
    width: 70,
    height: 70,
    // borderRadius: 35,
    // bordercolor: '#4CAF50',
    borderColor:'#4CAF50',
    borderWidth:2,
    borderRadius:50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  name: {
    fontSize: 13,
    color: '#555',
    maxWidth: 70,
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
  },
});