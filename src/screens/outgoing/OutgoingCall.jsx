import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { PhoneDeclineIcon } from '../../utils/svgs/CommonSvgs'
import { hangupCall, onCallState } from '../../services/sipService'

const OutgoingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName } = route.params || {}
  const displayName = callerName || phoneNumber || 'Unknown'
  const [callStatus, setCallStatus] = useState('Calling...')

  useEffect(() => {
    const unsubscribe = onCallState((event) => {
      if (event?.state === 'ringing') {
        setCallStatus('Ringing...')
      } else if (event?.state === 'connected') {
        setCallStatus('Connected')
      } else if (event?.state === 'failed') {
        setCallStatus('Call failed')
      } else if (event?.state === 'ended') {
        navigation.replace('BottomTabs')
      }
    })

    return unsubscribe
  }, [navigation])

  const handleEndCall = async () => {
    try {
      await hangupCall()
    } catch (error) {
      console.error('[SIP] Hangup failed:', error?.message || error)
    } finally {
      navigation.replace('BottomTabs')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.outgoingText}>{callStatus}</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.substring(0, 2).toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.name}>{displayName}</Text>
      {phoneNumber ? (
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <View style={[styles.iconContainer, styles.endCallIconBackground]}>
            <PhoneDeclineIcon width={32} height={32} />
          </View>
          <Text style={styles.endCallText}>End Call</Text>
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
  outgoingText: {
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
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  endCallButton: {
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
  endCallText: {
    fontSize: 16,
    color: '#B61723',
  },
  endCallIconBackground: {
    backgroundColor: '#B61723',
  },
})

export default OutgoingCall
