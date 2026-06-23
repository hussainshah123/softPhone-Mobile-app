import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { PhoneAcceptIcon, PhoneDeclineIcon } from '../../utils/svgs/CommonSvgs'

const IncommingCall = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.incomingText}>Incoming Call...</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <Text style={styles.name}>Jane Doe</Text>
      <Text style={styles.sipAddress}>sip:jane.doe@company.com</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.declineButton} onPress={() => navigation.replace('BottomTabs')}>
          <View style={[styles.iconContainer, styles.declineIconBackground]}>
            <PhoneDeclineIcon width={32} height={32} />
          </View>
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptButton}>
          <View style={[styles.iconContainer, styles.acceptIconBackground]}>
            <PhoneAcceptIcon width={32} height={32} />
          </View>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  incomingText: {
    fontSize: 18,
    color: '#5B403E',
    marginBottom: 90,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#B61723',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sipAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 60,
    justifyContent: 'space-around',
    width: '100%',
  },
  declineButton: {
    alignItems: 'center',
  },
  acceptButton: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  declineText: {
    fontSize: 16,
    color: '#B61723',
  },
  acceptText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  declineIconBackground: {
    backgroundColor: '#B61723',
  },
  acceptIconBackground: {
    backgroundColor: '#4CAF50',
  },
})

export default IncommingCall