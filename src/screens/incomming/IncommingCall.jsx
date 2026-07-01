import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native'
import { PhoneAcceptIcon, PhoneDeclineIcon, SpeakerIcon, MuteIcon } from '../../utils/svgs/CommonSvgs'
import { answerCall, declineCall, hangupCall, onCallState, toggleSpeaker, toggleMute } from '../../services/sipService'

const IncommingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName, destination } = route.params || {}
  const displayName = callerName || phoneNumber || 'Incoming Call'
  const callDestination = destination || phoneNumber || ''
  const [callStatus, setCallStatus] = useState('Incoming Call...')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const unsubscribe = onCallState((event) => {
      if (event?.state === 'connected') {
        setCallStatus('Connected')
      } else if (event?.state === 'ended' || event?.state === 'failed' || event?.state === 'declined') {
        navigation.replace('BottomTabs')
      }
    })

    return unsubscribe
  }, [navigation])

  const requestRecordPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access to make calls.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.error('[SIP] Permission error:', err)
        return false
      }
    }
    return true
  }

  const handleDecline = async () => {
    try {
      await declineCall()
    } catch (error) {
      console.error('[SIP] Decline failed:', error?.message || error)
    } finally {
      navigation.replace('BottomTabs')
    }
  }

  const handleAccept = async () => {
    const granted = await requestRecordPermission()
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone permission is needed to answer calls.')
      return
    }
    try {
      await answerCall()
      setCallStatus('Connected')
    } catch (error) {
      console.error('[SIP] Answer failed:', error?.message || error)
      navigation.replace('BottomTabs')
    }
  }

  const handleEndCall = async () => {
    try {
      await hangupCall()
    } catch (error) {
      console.error('[SIP] Hangup failed:', error?.message || error)
    } finally {
      navigation.replace('BottomTabs')
    }
  }

  const handleSpeakerToggle = async () => {
    try {
      const newState = await toggleSpeaker()
      setIsSpeakerOn(newState)
    } catch (error) {
      console.error('[SIP] Speaker toggle failed:', error)
    }
  }

  const handleMuteToggle = async () => {
    try {
      const newState = await toggleMute()
      setIsMuted(newState)
    } catch (error) {
      console.error('[SIP] Mute toggle failed:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.incomingText}>{callStatus}</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.substring(0, 2).toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.name}>{displayName}</Text>
      {callDestination ? (
        <Text style={styles.sipAddress}>
          {callDestination.length > 15 ? callDestination.substring(0, 15) + '...' : callDestination}
        </Text>
      ) : null}

      <View style={styles.buttonContainer}>
        {callStatus === 'Connected' ? (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={handleMuteToggle}>
              <View style={[styles.iconContainer, isMuted && styles.activeIconBackground]}>
                <MuteIcon width={24} height={24} color={isMuted ? '#FFFFFF' : '#666'} />
              </View>
              <Text style={styles.iconLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineButton} onPress={handleEndCall}>
              <View style={[styles.iconContainer, styles.declineIconBackground]}>
                <PhoneDeclineIcon width={32} height={32} />
              </View>
              <Text style={styles.declineText}>End Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleSpeakerToggle}>
              <View style={[styles.iconContainer, isSpeakerOn && styles.activeIconBackground]}>
                <SpeakerIcon width={24} height={24} color={isSpeakerOn ? '#FFFFFF' : '#666'} />
              </View>
              <Text style={styles.iconLabel}>{isSpeakerOn ? 'Earpiece' : 'Speaker'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
              <View style={[styles.iconContainer, styles.declineIconBackground]}>
                <PhoneDeclineIcon width={32} height={32} />
              </View>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <View style={[styles.iconContainer, styles.acceptIconBackground]}>
                <PhoneAcceptIcon width={32} height={32} />
              </View>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
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
    marginBottom: 20,
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
  iconButton: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F0F3FF',
  },
  activeIconBackground: {
    backgroundColor: '#4CAF50',
  },
  declineText: {
    fontSize: 16,
    color: '#B61723',
  },
  acceptText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
  },
})

export default IncommingCall
