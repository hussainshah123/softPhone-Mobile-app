import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CallIcon, BackspaceIcon, NotificationIcon } from '../../utils/svgs/CommonSvgs'
import Header from '../../components/Header'
import { makeCall } from '../../services/sipService'

const DialPad = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [sipCredentials, setSipCredentials] = useState(null)

    useEffect(() => {
        loadCredentials()
    }, [])

    const loadCredentials = async () => {
        try {
            const credentials = await AsyncStorage.getItem('sipCredentials')
            if (credentials) {
                setSipCredentials(JSON.parse(credentials))
            }
        } catch (error) {
            console.error('Failed to load SIP credentials:', error)
        }
    }

    const dialPadNumbers = [
        { number: '1', letters: '' },
        { number: '2', letters: 'ABC' },
        { number: '3', letters: 'DEF' },
        { number: '4', letters: 'GHI' },
        { number: '5', letters: 'JKL' },
        { number: '6', letters: 'MNO' },
        { number: '7', letters: 'PQRS' },
        { number: '8', letters: 'TUV' },
        { number: '9', letters: 'WXYZ' },
        { number: '*', letters: '' },
        { number: '0', letters: '+' },
        { number: '#', letters: '' },
    ]

    const handlePress = (number) => {
        setPhoneNumber(phoneNumber + number)
    }

    const handleDelete = () => {
        setPhoneNumber(phoneNumber.slice(0, -1))
    }

    const handleClear = () => {
        setPhoneNumber('')
    }

    const handleCall = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter a number to call')
            return
        }
        if (!sipCredentials) {
            Alert.alert('Error', 'Please login with SIP credentials first')
            return
        }

        navigation.getParent()?.navigate('OutgoingCall', {
            phoneNumber,
            callerName: phoneNumber,
        })

        try {
            await makeCall(
                sipCredentials.username,
                sipCredentials.password,
                sipCredentials.server,
                sipCredentials.port,
                phoneNumber
            )
        } catch (error) {
            Alert.alert('Call Failed', error.message)
            navigation.getParent()?.navigate('BottomTabs')
        }
    }

    return (
        <View style={styles.container}>
            {/* <Header
                title="Softphone"
                titleStyle={{
                    color: '#B61723',
                    textAlign: 'center',
                }}
                containerStyle={{ marginTop: 20 }}
                leftComponent={
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                        style={styles.headerAvatar}
                    />
                }
                rightComponent={<NotificationIcon />}
            /> */}
            <View style={styles.displayContainer}>
                <Text style={styles.phoneNumberText}>
                    {phoneNumber || '|'}
                </Text>
                {phoneNumber.length > 0 && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <BackspaceIcon width={24} height={24} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.dialPadContainer}>
                {dialPadNumbers.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.dialButton}
                        onPress={() => handlePress(item.number)}
                    >
                        <Text style={styles.dialNumber}>{item.number}</Text>
                        {item.letters && (
                            <Text style={styles.dialLetters}>{item.letters}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <CallIcon width={25} height={25} fill="white" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: "center",
        alignSelf: 'center',
        color: '#B61723',
    },
    menuButton: {
        padding: 10,
        marginLeft: 120,
    },
    displayContainer: {
        marginTop:50,
        width: '100%',
        alignItems: 'center',
        // marginBottom: 20,
        position: 'relative',
    },
     headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    phoneNumberText: {
        fontSize: 32,
        paddingHorizontal:35,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 5,
        padding: 10,
    },
    dialPadContainer: {
        marginTop:20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dialButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F3F4',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    dialNumber: {
        fontSize: 26,
        fontWeight: '600',
        color: '#333',
    },
    dialLetters: {
        fontSize: 10,
        color: '#999',
        marginTop: 2,
    },
    callButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#006E1C',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#45d469',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})

export default DialPad