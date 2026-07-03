import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native'
import { PhoneDeclineIcon, SpeakerIcon, MuteIcon } from '../../utils/svgs/CommonSvgs'
import { hangupCall, onCallState, toggleSpeaker, toggleMute } from '../../services/sipService'

const OutgoingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName } = route.params || {}
  const displayName = callerName || phoneNumber || 'Unknown'
  const [callStatus, setCallStatus] = useState('Calling...')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    requestRecordPermission()

    const unsubscribe = onCallState((event) => {
      if (event?.state === 'connecting') {
        setCallStatus('Calling...')
      } else if (event?.state === 'ringing') {
        setCallStatus('Ringing...')
      } else if (event?.state === 'connected') {
        setCallStatus('Connected')
      } else if (event?.state === 'declined') {
        setCallStatus('Call Declined')
        setTimeout(() => {
          navigation.replace('BottomTabs')
        }, 2000)
      } else if (event?.state === 'failed') {
        setCallStatus('Call failed')
        setTimeout(() => {
          navigation.replace('BottomTabs')
        }, 2000)
      } else if (event?.state === 'ended') {
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
        {callStatus === 'Connected' ? (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={handleMuteToggle}>
              <View style={[styles.iconContainer, isMuted && styles.activeIconBackground]}>
                <MuteIcon width={24} height={24} color={isMuted ? '#FFFFFF' : '#666'} />
              </View>
              <Text style={styles.iconLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <View style={[styles.iconContainer, styles.endCallIconBackground]}>
                <PhoneDeclineIcon width={32} height={32} />
              </View>
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleSpeakerToggle}>
              <View style={[styles.iconContainer, isSpeakerOn && styles.activeIconBackground]}>
                <SpeakerIcon width={24} height={24} color={isSpeakerOn ? '#FFFFFF' : '#666'} />
              </View>
              <Text style={styles.iconLabel}>{isSpeakerOn ? 'Earpiece' : 'Speaker'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <View style={[styles.iconContainer, styles.endCallIconBackground]}>
              <PhoneDeclineIcon width={32} height={32} />
            </View>
            <Text style={styles.endCallText}>Cancel</Text>
          </TouchableOpacity>
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
    flexDirection:'row',
    gap:10,
    marginTop: 60,
    alignItems: 'center',
    width: '100%',
  },
  endCallButton: {
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
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
  endCallText: {
    fontSize: 16,
    color: '#B61723',
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
  },
})

export default OutgoingCall
