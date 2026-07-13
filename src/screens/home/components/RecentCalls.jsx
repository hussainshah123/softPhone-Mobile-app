import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';


import { recentCalls } from '../data/dummyData.js'

const RecentCalls = ({ navigation, data }) => {
  const displayData = data || recentCalls;

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
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <Text style={styles.name}>
              {item.name}
            </Text>
          </View>
        )}
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

  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },

  name: {
    fontSize: 13,
    color: '#555',
  },
});