import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { PhoneDeclineIcon, SpeakerIcon, MuteIcon } from '../../utils/svgs/CommonSvgs'
import { hangupCall, onCallState, toggleSpeaker, toggleMute } from '../../services/sipService'
import { saveCallHistory } from '../../services/callHistoryService'
import { formatDuration } from '../../utils/callHelper'

const OutgoingCall = ({ route, navigation }) => {
  const { phoneNumber, callerName } = route.params || {}
  const displayName = callerName || phoneNumber || 'Unknown'
  const [callStatus, setCallStatus] = useState('Calling...')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const navigatedBack = useRef(false)
  const callStartRef = useRef(null)
  const durationTimerRef = useRef(null)

  // Begin counting the connected time. Called once when the call connects; the
  // interval ticks the on-screen mm:ss timer every second.
  const startDurationTimer = () => {
    if (callStartRef.current) return
    callStartRef.current = Date.now()
    durationTimerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - callStartRef.current) / 1000))
    }, 1000)
  }

  // Total connected seconds so far (0 if the call never connected).
  const getCallDuration = () =>
    callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0

  const returnToApp = () => {
    if (navigatedBack.current) {
      console.log('[OutgoingCall] Already navigated, skipping')
      return
    }
    navigatedBack.current = true
    console.log('[OutgoingCall] Navigating back to BottomTabs')

    try {
      // Force reset to BottomTabs
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTabs' }],
      })
    } catch (e) {
      console.error('[OutgoingCall] Reset navigation failed:', e)
      try {
        // Fallback to navigate
        navigation.navigate('BottomTabs')
      } catch (err) {
        console.error('[OutgoingCall] Navigate failed:', err)
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
        startDurationTimer()
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
      } else if (event?.state === 'busy') {
        // Remote party is busy or rejected the call. The native module speaks
        // "The user you are calling is busy. Please try again later." — we hold
        // the screen briefly so the announcement can play, then end the call.
        setCallStatus('User is busy, please try again')
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: 'missed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save failed:', err))
        setTimeout(() => {
          returnToApp()
        }, 4500)
      } else if (event?.state === 'no_answer') {
        setCallStatus('No answer, please try again')
        saveCallHistory({
          name: displayName,
          number: phoneNumber,
          type: 'missed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save failed:', err))
        setTimeout(() => {
          returnToApp()
        }, 4500)
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
          duration: getCallDuration(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).catch(err => console.error('[OutgoingCall] Save on ended failed:', err))
        returnToApp()
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

  const handleEndCall = async () => {
    console.log('[OutgoingCall] User initiated call end')

    try {
      // Send hangup command to SIP server
      console.log('[OutgoingCall] Sending hangup command...')
      const hangupResult = await hangupCall()
      console.log('[OutgoingCall] Hangup command result:', hangupResult)
    } catch (error) {
      console.error('[OutgoingCall] Hangup command error:', error?.message || error)
    }

    // Save call history immediately
    try {
      await saveCallHistory({
        name: displayName,
        number: phoneNumber,
        type: 'outgoing',
        duration: getCallDuration(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      console.log('[OutgoingCall] Call history saved')
    } catch (err) {
      console.error('[OutgoingCall] Save error:', err)
    }

    // Navigate back with a timeout fallback
    // First timeout: Give SIP time to process (1 second)
    const navigationTimeout = setTimeout(() => {
      console.log('[OutgoingCall] Navigation timeout triggered - forcing return to app')
      returnToApp()
    }, 1000)

    // Also wait for the event listener to trigger (which should be faster)
    // The event listener will call returnToApp() when 'ended' is received
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
      <Text style={[styles.outgoingText, callStatus === 'Connected' && styles.outgoingTextConnected]}>
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
  outgoingTextConnected: {
    marginBottom: 8,
  },
  durationText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
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
