// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
// import React, { useEffect, useState, useCallback } from 'react'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { NotificationIcon, CallIcon, ContactIcon, MessageIcon, VoiceMailIcon, AntinaIcon, GreenIcon, RightArrowIcon } from '../../utils/svgs/CommonSvgs'
// import Header from '../../components/Header'
// import { onRegistrationState } from '../../services/sipService'
// import { getCallHistory } from '../../services/callHistoryService'
// import { useFocusEffect } from '@react-navigation/native'

// const Home = ({ navigation }) => {
//     const [registrationStatus, setRegistrationStatus] = useState({
//         state: 'unknown',
//         message: 'Checking SIP status...',
//     })
//     const [sipUsername, setSipUsername] = useState('')
//     const [recentCalls, setRecentCalls] = useState([])

//     useEffect(() => {
//         const loadCredentials = async () => {
//             try {
//                 const credentials = await AsyncStorage.getItem('sipCredentials')
//                 if (credentials) {
//                     const parsed = JSON.parse(credentials)
//                     setSipUsername(parsed.username || '')
//                 }
//             } catch (error) {
//                 console.error('[SIP] Failed to load credentials:', error)
//             }
//         }

//         loadCredentials()

//         const unsubscribe = onRegistrationState((event) => {
//             setRegistrationStatus({
//                 state: event?.state || 'unknown',
//                 message: event?.message || '',
//             })
//         })

//         return unsubscribe
//     }, [])

//     useFocusEffect(
//     React.useCallback(() => {
//       const loadCallHistory = async () => {
//         const history = await getCallHistory()
//         console.log('[Home] Loaded call history count:', history.length)
//         setRecentCalls(history.slice(0, 3))
//       }
//       loadCallHistory()
//       return () => {}
//     }, [])
//   )

//     const isRegistered = registrationStatus.state === 'registered'

//     const handleContactsPress = () => {
//         navigation.navigate('Contact')
//     }

//     const renderRecentCall = (item) => (
//         <View key={item.id} style={styles.callItem}>
//             <View style={styles.avatar}>
//                 <Text style={styles.avatarText}>{item.name ? item.name.substring(0, 2).toUpperCase() : '?'}</Text>
//             </View>
//             <View style={styles.callInfo}>
//                 <Text style={styles.name}>{item.name}</Text>
//                 <Text style={styles.number}>{item.number}</Text>
//             </View>
//             <View style={styles.callMeta}>
//                 <Text style={styles.time}>{new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
//                 <View style={[
//                     styles.callTypeIcon,
//                     item.type === 'incoming' && styles.incoming,
//                     item.type === 'outgoing' && styles.outgoing,
//                     item.type === 'missed' && styles.missed
//                 ]}>
//                     <Text style={styles.callTypeText}>
//                         {item.type === 'incoming' ? '↖' : item.type === 'outgoing' ? '↑' : '↓'}
//                     </Text>
//                 </View>
//             </View>
//         </View>
//     )

//     return (
//         <View style={styles.container}>
//             <Header
//                 title="Softphone"
//                 titleStyle={{
//                     color: '#B61723',
//                     textAlign: 'center',
//                 }}
//                 containerStyle={{ marginTop: 20, marginBottom: 20 }}
//                 leftComponent={
//                     <Image
//                         source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
//                         style={styles.headerAvatar}
//                     />
//                 }
//                 rightComponent={<NotificationIcon />}
//             />

//             <ScrollView style={styles.content}>
//                 <View style={styles.register}>
//                     <AntinaIcon />
//                     <View>
//                         <View style={styles.registerHeader}>
//                             {isRegistered ? <GreenIcon /> : null}
//                             <Text style={styles.registerText}>
//                                 {isRegistered ? 'Registered & Ready' : 'Not Registered'}
//                             </Text>
//                         </View>
//                         <Text style={styles.registerSubText}>
//                             {sipUsername ? `${sipUsername} • ${registrationStatus.message}` : registrationStatus.message}
//                         </Text>
//                     </View>
//                     <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
//                         <RightArrowIcon />
//                     </TouchableOpacity>
//                 </View>
//                 <View style={styles.quickActionsContainer}>
//                     <View style={styles.quickActionsRow}>
//                         <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('DialPad')}>
//                             <View style={styles.quickActionIcon}>
//                                 <CallIcon width={24} height={24} />
//                             </View>
//                             <Text style={styles.quickActionText}>New Call</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.quickActionItem} onPress={handleContactsPress}>
//                             <View style={styles.quickActionIcon}>
//                                 <ContactIcon />
//                             </View>
//                             <Text style={styles.quickActionText}>Contacts</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <View style={styles.quickActionsRow}>
//                         <TouchableOpacity style={styles.quickActionItem}>
//                             <View style={styles.quickActionIcon}>
//                                 <MessageIcon />
//                             </View>
//                             <Text style={styles.quickActionText}>Message</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('VoiceMail')}>
//                             <View style={styles.quickActionIcon}>
//                                 <VoiceMailIcon />
//                             </View>
//                             <Text style={styles.quickActionText}>VoiceMail</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>

//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitle}>Recent Calls</Text>
//                     <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
//                         <Text style={styles.sectionSeeall}>See All</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {recentCalls.length > 0 ? (
//                     recentCalls.map((item) => renderRecentCall(item))
//                 ) : (
//                     <View style={{padding: 20, alignItems: 'center'}}>
//                         <Text style={{color: '#666'}}>No call history</Text>
//                     </View>
//                 )}
//             </ScrollView>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     headerAvatar: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         marginRight: 8,
//     },
//     content: {
//         flex: 1,
//         paddingHorizontal: 20,
//     },
//     register: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//         marginBottom: 20,
//         paddingHorizontal: 20,
//         backgroundColor: 'white',
//         borderRadius: 10,
//         paddingVertical: 10,
//         justifyContent: "space-between",
//         borderLeftWidth: 3,
//         borderLeftColor: '#B61723'
//     },
//     registerHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//     },
//     registerText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#575F66',
//     },
//     registerSubText: {
//         fontSize: 14,
//         color: '#575F66',
//     },
//     quickActionsContainer: {
//         marginBottom: 25,
//     },
//     quickActionsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 15,
//     },
//     quickActionItem: {
//         backgroundColor: "white",
//         paddingVertical: 20,
//         borderRadius: 10,
//         marginHorizontal: 10,
//         alignItems: 'center',
//         flex: 1,
//     },
//     quickActionIcon: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: '#FFDAD7',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     quickActionText: {
//         fontSize: 12,
//         color: '#666',
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     sectionSeeall: {
//         color: '#B61723',
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
//     callItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 15,
//         borderBottomWidth: 1,
//         backgroundColor:'white',
//         borderRadius:10,
//         paddingHorizontal:10,
//         borderBottomColor: '#EEE',
//     },
//     avatar: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: '#F0F3FF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 15,
//     },
//     avatarText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#B61723',
//     },
//     callInfo: {
//         flex: 1,
//     },
//     name: {
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 4,
//     },
//     number: {
//         fontSize: 14,
//         color: '#666',
//     },
//     callMeta: {
//         alignItems: 'flex-end',
//     },
//     time: {
//         fontSize: 12,
//         color: '#999',
//         marginBottom: 4,
//     },
//     callTypeIcon: {
//         width: 24,
//         height: 24,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     incoming: {
//         backgroundColor: '#E8F5E9',
//     },
//     outgoing: {
//         backgroundColor: '#E3F2FD',
//     },
//     missed: {
//         backgroundColor: '#FFEBEE',
//     },
//     callTypeText: {
//         fontSize: 14,
//         fontWeight: 'bold',
//     },
// })

// export default Home
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import HomeHeader from './components/HomeHeader';
import SearchBar from './components/SearchBar';
import PremiumCard from './components/PremiumCard';
import RecentCalls from './components/RecentCalls';
import FavoriteContacts from './components/FavoriteContacts';
import { SafeAreaView } from 'react-native-safe-area-context';
import sipConnectionManager from '../../services/sipConnectionManager';
import { useFocusEffect } from '@react-navigation/native';

const Home = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const initializeSIPConnection = async () => {
            try {
                console.log('[Home] Initializing SIP connection...');
                const success = await sipConnectionManager.initializeConnection();
                if (success) {
                    console.log('[Home] SIP connection initialized successfully');
                } else {
                    console.log('[Home] SIP connection initialization attempted but user may not be authenticated');
                }
            } catch (error) {
                console.error('[Home] Error initializing SIP connection:', error.message);
            }
        };

        initializeSIPConnection();

        return () => {
            // Cleanup on unmount
            console.log('[Home] Component unmounting, keeping SIP connection active');
        };
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log('[Home] Screen focused, refreshing data');
            setRefreshKey(prev => prev + 1);
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <HomeHeader />

                <SearchBar onSearch={setSearchText} />

                {!searchText && <PremiumCard />}

                <RecentCalls
                    key={`recent-${refreshKey}`}
                    navigation={navigation}
                />

                <FavoriteContacts
                    key={`favorite-${refreshKey}`}
                    navigation={navigation}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
});