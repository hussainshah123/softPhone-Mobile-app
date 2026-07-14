import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CallIcon, PhoneAcceptIcon, VideoCallIcon } from '../../../utils/svgs/CommonSvgs';

const ContactCard = ({ item }) => {
  const initials = (item.name || item.number || '?')
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const hasImage = item.image && item.image.startsWith('http');

  return (
    <TouchableOpacity style={styles.card}>
      {hasImage ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
        />
      ) : (
        <View style={styles.avatarContainer}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
      )}

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.callicon}>
          <PhoneAcceptIcon />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.VideoIcon}>
          <VideoCallIcon />
        </TouchableOpacity> */}

      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    alignItems: 'center',

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: .08,
    shadowRadius: 10,
  },

  image: {
    width: 75,
    height: 75,
    borderRadius: 40,
    marginBottom: 10,
  },

  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#006E1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  initials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    maxWidth: '100%',
  },

  status: {
    marginTop: 4,
    color: '#7ED957',
    fontSize: 12,
  },
  callicon:{
    backgroundColor:'#4CAF50',
    borderRadius:20,
    padding:8,
    marginRight:10
  },
  VideoIcon:{
    paddingTop:13,
    backgroundColor:'#fff',
    borderRadius:20,
    // padding:8,
    paddingHorizontal:12,
    borderWidth:1,
    borderColor:'#4CAF50',
    marginRight:10
  },
  iconContainer:{
    flexDirection:'row',
    marginTop:10
  }
});