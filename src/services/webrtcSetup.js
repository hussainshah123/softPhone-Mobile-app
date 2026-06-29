import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
} from 'react-native-webrtc'

export const setupWebRTC = () => {
    if (global.RTCPeerConnection) {
        return
    }

    global.RTCPeerConnection = RTCPeerConnection
    global.RTCSessionDescription = RTCSessionDescription
    global.RTCIceCandidate = RTCIceCandidate
    global.navigator = global.navigator || {}
    global.navigator.mediaDevices = mediaDevices
}
