import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import ContactCard from './ContactCard';
import { favoriteContacts } from '../data/dummyData';
import { FavrateIcon } from '../../../utils/svgs/CommonSvgs';

const FavoriteContacts = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite Contacts</Text>

        <TouchableOpacity>

        {/* // onPress={() => navigation.navigate('Contact')} */}
          <FavrateIcon/>
          {/* <Text style={styles.seeAll}>See All</Text> */}
        </TouchableOpacity>
      </View>

      <FlatList
        data={favoriteContacts}
        keyExtractor={(item) => item.id}
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
});