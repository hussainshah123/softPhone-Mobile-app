import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native'
import { PhoneAcceptIcon, PhoneDeclineIcon, SpeakerIcon, MuteIcon } from '../../utils/svgs/CommonSvgs'
import { answerCall, declineCall, hangupCall, onCallState, toggleSpeaker, toggleMute } from '../../services/sipService'
import { saveCallHistory } from '../../services/callHistoryService'
import { formatDuration } from '../../utils/callHelper'

const IncommingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName, destination } = route.params || {}
  const displayName = callerName || phoneNumber || 'Incoming Call'
  const callDestination = destination || phoneNumber || ''
  const [callStatus, setCallStatus] = useState('Incoming Call...')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const callStartRef = useRef(null)
  const durationTimerRef = useRef(null)

  // Begin counting connected time once the call connects; ticks the mm:ss timer.
  const startDurationTimer = () => {
    if (callStartRef.current) return
    callStartRef.current = Date.now()
    durationTimerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - callStartRef.current) / 1000))
    }, 1000)
  }

  // Total connected seconds so far (0 if the call was never answered).
  const getCallDuration = () =>
    callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0

  useEffect(() => {
    const unsubscribe = onCallState((event) => {
      if (event?.state === 'connected') {
        setCallStatus('Connected')
        startDurationTimer()
      } else if (event?.state === 'ended' || event?.state === 'failed' || event?.state === 'declined') {
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: event?.state === 'ended' ? 'incoming' : 'missed',
          duration: getCallDuration(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[IncomingCall] Save failed:', err))
        navigation.popToTop()
      }
    })

    return () => {
      unsubscribe()
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
        durationTimerRef.current = null
      }
    }
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

  const handleDecline = async () => {
    console.log('[IncomingCall] User declined call')
    try {
      console.log('[IncomingCall] Sending decline command...')
      const declineResult = await declineCall()
      console.log('[IncomingCall] Decline command result:', declineResult)
    } catch (error) {
      console.error('[IncomingCall] Decline command error:', error?.message || error)
    }

    // Try to save call history
    try {
      await saveCallHistory({
        name: displayName,
        number: phoneNumber,
        type: 'missed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      console.log('[IncomingCall] Call history saved')
    } catch (err) {
      console.error('[IncomingCall] Save error:', err)
    }

    // Navigate back with timeout fallback
    setTimeout(() => {
      console.log('[IncomingCall] Navigation timeout triggered - returning to BottomTabs')
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomTabs' }],
        })
      } catch (e) {
        console.error('[IncomingCall] Reset failed:', e)
        navigation.replace('BottomTabs')
      }
    }, 1000)
  }

  const handleAccept = async () => {
    const granted = await requestRecordPermission()
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone permission is needed to answer calls.')
      return
    }
    try {
      console.log('[IncomingCall] Sending answer command...')
      await answerCall()
      console.log('[IncomingCall] Answer command successful')
      setCallStatus('Connected')
      startDurationTimer()
    } catch (error) {
      console.error('[IncomingCall] Answer failed:', error?.message || error)
      Alert.alert('Error', 'Failed to answer call')
      navigation.replace('BottomTabs')
    }
  }

  const handleEndCall = async () => {
    console.log('[IncomingCall] User ended call')
    try {
      console.log('[IncomingCall] Sending hangup command...')
      const hangupResult = await hangupCall()
      console.log('[IncomingCall] Hangup command result:', hangupResult)
    } catch (error) {
      console.error('[IncomingCall] Hangup command error:', error?.message || error)
    }

    // Try to save call history
    try {
      await saveCallHistory({
        name: displayName,
        number: phoneNumber,
        type: 'incoming',
        duration: getCallDuration(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      console.log('[IncomingCall] Call history saved')
    } catch (err) {
      console.error('[IncomingCall] Save error:', err)
    }

    // Navigate back with timeout fallback
    setTimeout(() => {
      console.log('[IncomingCall] Navigation timeout triggered - returning to BottomTabs')
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomTabs' }],
        })
      } catch (e) {
        console.error('[IncomingCall] Reset failed:', e)
        navigation.replace('BottomTabs')
      }
    }, 1000)
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
      <Text style={[styles.incomingText, callStatus === 'Connected' && styles.incomingTextConnected]}>
        {callStatus}
      </Text>
      {callStatus === 'Connected' ? (
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      ) : null}

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
  incomingTextConnected: {
    marginBottom: 8,
  },
  durationText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#006E1C',
    marginBottom: 74,
    fontVariant: ['tabular-nums'],
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
