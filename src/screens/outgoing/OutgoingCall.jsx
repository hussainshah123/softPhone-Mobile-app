import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { PhoneDeclineIcon, SpeakerIcon, MuteIcon } from '../../utils/svgs/CommonSvgs'
import { hangupCall, onCallState, toggleSpeaker, toggleMute } from '../../services/sipService'
import { saveCallHistory } from '../../services/callHistoryService'

const OutgoingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName } = route.params || {}
  const displayName = callerName || phoneNumber || 'Unknown'
  const [callStatus, setCallStatus] = useState('Calling...')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const navigatedBack = useRef(false)

  const returnToApp = () => {
    if (navigatedBack.current) return
    navigatedBack.current = true
    try {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate('BottomTabs')
      }
    } catch (e) {
      try {
        navigation.navigate('BottomTabs')
      } catch (err) {
        console.error('[OutgoingCall] Navigation back failed:', err)
      }
    }
  }

  useEffect(() => {
    requestRecordPermission()

    const unsubscribe = onCallState((event) => {
      console.log('[OutgoingCall] Call state received:', event?.state, event?.remoteNumber)
      if (event?.state === 'connecting') {
        setCallStatus('Calling...')
      } else if (event?.state === 'ringing') {
        setCallStatus('Ringing...')
      } else if (event?.state === 'connected') {
        setCallStatus('Connected')
      } else if (event?.state === 'declined') {
        setCallStatus('Call Declined')
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: 'missed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save failed:', err))
        setTimeout(() => {
          returnToApp()
        }, 2000)
      } else if (event?.state === 'failed') {
        setCallStatus('Call failed')
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: 'missed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save failed:', err))
        setTimeout(() => {
          returnToApp()
        }, 2000)
      } else if (event?.state === 'ended') {
        console.log('[OutgoingCall] Call ended event - saving history and navigating back')
        // Save for connected calls that ended (remote ended the call)
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: 'outgoing',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save on ended failed:', err))
        returnToApp()
      }
    })

    return unsubscribe
  }, [navigation, phoneNumber, displayName])

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
    // Save call history - wait for it to complete
    saveCallHistory({
      name: displayName,
      number: phoneNumber,
      type: 'outgoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }).then(() => {
      console.log('[OutgoingCall] Call history saved')
    }).catch(err => console.error('[OutgoingCall] Save error:', err))
    try {
      await hangupCall()
    } catch (error) {
      console.error('[SIP] Hangup failed:', error?.message || error)
    }
    
    // Small delay to ensure async storage completes
    setTimeout(() => {
      returnToApp()
    }, 200)
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
    <LinearGradient
      colors={['#004d14', '#006E1C', '#008a23']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
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
            <TouchableOpacity style={styles.iconButtonLeft} onPress={handleMuteToggle}>
              <View style={[styles.iconContainer, isMuted && styles.activeIconBackground]}>
                <MuteIcon width={24} height={24} color={isMuted ? '#FFFFFF' : '#FFFFFF'} />
              </View>
              <Text style={styles.iconLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <View style={[styles.iconContainer, styles.endCallIconBackground]}>
                <PhoneDeclineIcon width={32} height={32} />
              </View>
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButtonRight} onPress={handleSpeakerToggle}>
              <View style={[styles.iconContainer, isSpeakerOn && styles.activeIconBackground]}>
                <SpeakerIcon width={24} height={24} color={isSpeakerOn ? '#FFFFFF' : '#FFFFFF'} />
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
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  outgoingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 90,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  phoneNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection:'row',
    gap:10,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  endCallButton: {
    alignItems: 'center',
  },
  iconButtonLeft: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  iconButtonRight: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endCallIconBackground: {
    backgroundColor: '#B61723',
  },
  endCallText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  iconLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
})

export default OutgoingCall
