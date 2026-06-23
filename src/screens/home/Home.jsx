import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native'
import React from 'react'
import { NotificationIcon, CallIcon, ContactIcon, MessageIcon, VoiceMailIcon, AntinaIcon, GreenIcon, RightArrowIcon, MicIcon } from '../../utils/svgs/CommonSvgs'
import Header from '../../components/Header'

const Home = ({ navigation }) => {
    
    const recentCalls = [
        {
            id: '1',
            name: 'Jane Doe',
            number: 'sip:jane.doe@company.com',
            time: '10:30 AM',
            type: 'incoming',
            initials: 'JD',
        },
        {
            id: '2',
            name: 'John Smith',
            number: 'sip:john.smith@company.com',
            time: 'Yesterday',
            type: 'outgoing',
            initials: 'JS',
        },
        {
            id: '3',
            name: 'Alice Johnson',
            number: 'sip:alice.j@company.com',
            time: 'Yesterday',
            type: 'missed',
            initials: 'AJ',
        },
    ]

    const renderRecentCall = (item) => (
        <View style={styles.callItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.callInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.number}>{item.number}</Text>
            </View>
            <View style={styles.callMeta}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={[
                    styles.callTypeIcon,
                    item.type === 'incoming' && styles.incoming,
                    item.type === 'outgoing' && styles.outgoing,
                    item.type === 'missed' && styles.missed
                ]}>
                    <Text style={styles.callTypeText}>
                        {item.type === 'incoming' ? '↓' : item.type === 'outgoing' ? '↑' : '✕'}
                    </Text>
                </View>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <Header
                title="Softphone"
                titleStyle={{
                    color: '#B61723',
                    textAlign: 'center',
                }}
                containerStyle={{ marginTop: 20, marginBottom: 20 }}
                leftComponent={
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                        style={styles.headerAvatar}
                    />
                }
                rightComponent={<NotificationIcon />}
            />

            <ScrollView style={styles.content}>
                <View style={styles.register}>
                    <AntinaIcon />
                    <View>
                        <View style={styles.registerHeader}>
                            <GreenIcon />
                            <Text style={styles.registerText}>Registered & Ready</Text>
                        </View>
                        <Text style={styles.registerSubText}>Extension 1004 • SIP Connected</Text>


                    </View>
                    <TouchableOpacity>
                        <RightArrowIcon />
                    </TouchableOpacity>
                </View>
                <View style={styles.quickActionsContainer}>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity style={styles.quickActionItem}>
                            <View style={styles.quickActionIcon}>
                                <CallIcon width={24} height={24} />
                            </View>
                            <Text style={styles.quickActionText}>New Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionItem}>
                            <View style={styles.quickActionIcon}>
                                <ContactIcon />
                            </View>
                            <Text style={styles.quickActionText}>Contacts</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity style={styles.quickActionItem}>
                            <View style={styles.quickActionIcon}>
                                <MessageIcon />
                            </View>
                            <Text style={styles.quickActionText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionItem}>
                            <View style={styles.quickActionIcon}>
                                <VoiceMailIcon />
                            </View>
                            <Text style={styles.quickActionText}>VoiceMail</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Calls</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RecentCallHistory')}>
                        <Text style={styles.sectionSeeall}>See All</Text>
                    </TouchableOpacity>
                </View>

                {recentCalls.map((item) => renderRecentCall(item))}
            </ScrollView>
            {/* 
            <TouchableOpacity style={styles.fab}>
                <Text style={styles.fabIcon}>📞</Text>
            </TouchableOpacity> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#D3DAEA',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#B61723',
    },
    menuButton: {
        padding: 10,
    },
    menuIcon: {
        fontSize: 24,
        color: '#575F66',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchInput: {
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    register: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 10,
        justifyContent: "space-between",
        borderLeftWidth: 3,
        borderLeftColor: '#B61723'
    },
    registerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    registerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#575F66',
    },
    registerSubText: {
        fontSize: 14,
        color: '#575F66',
    },
    quickActionsContainer: {
        marginBottom: 25,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    quickActionItem: {
        backgroundColor: "white",
        // gap: 10,
        paddingVertical: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        flex: 1,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFDAD7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionEmoji: {
        fontSize: 24,
    },
    quickActionText: {
        fontSize: 12,
        color: '#666',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionSeeall: {
        color: '#B61723',
        fontWeight: 'bold',
        fontSize: 18,
    },
    callItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        backgroundColor:'white',
        borderRadius:10,
        paddingHorizontal:10,
        borderBottomColor: '#EEE',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#B61723',
    },
    callInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    number: {
        fontSize: 14,
        color: '#666',
    },
    callMeta: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    callTypeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    incoming: {
        backgroundColor: '#E8F5E9',
    },
    outgoing: {
        backgroundColor: '#E3F2FD',
    },
    missed: {
        backgroundColor: '#FFEBEE',
    },
    callTypeText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#B61723',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#B61723',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 24,
    },
})

export default Home