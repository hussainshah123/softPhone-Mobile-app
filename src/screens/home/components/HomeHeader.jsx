import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

import { NotificationIcon } from '../../../utils/svgs/CommonSvgs';

const HomeHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image
          source={{
            uri: 'https://i.pravatar.cc/150?img=68',
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.greeting}>
            Good morning,
            <Text style={styles.name}> User</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity>
        <NotificationIcon fill="white"/>
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderWidth:1,
    borderColor:"white",
    borderRadius: 24,
    marginRight: 12,
  },

  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },

  name: {
    fontWeight: '700',
    color:"white"
  },
});