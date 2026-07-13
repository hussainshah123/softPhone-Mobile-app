import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
    Switch,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AboutIcon, ConfrenceCall, DoNotDistrubIcon, HelpAndSupportIcon, HelpIcon, KeyIcon, LogoutIcon, NotificationIcon, RightArrowIcon, RingIcon, SignalIcon, SipAccountIcon, VoiceMailIcon, VolumIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';
import CustomAlert from '../../components/CustomAlert';

const Setting = ({ navigation }) => {
    const [isDND, setIsDND] = useState(true);
    const [alert, setAlert] = useState({
        visible: false,
        type: 'warning',
        title: '',
        message: '',
        confirmText: 'OK',
        onConfirm: null,
    });

    return (
        <View style={styles.container}>
            <Header
                title="Profile"
                titleStyle={{
                    color: '#006E1C',
                    textAlign: 'center',
                }}
                // containerStyle={{ marginTop: 20 }}
                // leftComponent={
                //     <Image
                //         source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                //         style={styles.headerAvatar}
                //     />
                // }
                rightComponent={<NotificationIcon />}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* User Profile */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                        style={styles.profileAvatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Alex Mercer</Text>
                        <Text style={styles.profileEmail}>sip.alex@softphone.enterprise.com</Text>
                    </View>
                </View>

                {/* ACCOUNT Section */}
                <View style={styles.section}>
                    {/* <Text style={styles.sectionTitle}>ACCOUNT</Text> */}

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SipAccountScreen')}>
                        <View style={styles.menuIcon}>
                            <SipAccountIcon />

                        </View>
                        <Text style={styles.menuText}>Sip Account</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CallQualityScreen')}>
                        <View style={styles.menuIcon}>
                            <SignalIcon />

                        </View>
                        <Text style={styles.menuText}>Call Quality</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HelpAndSupportScreen')}>
                        <View style={styles.menuIcon}>
                            <HelpAndSupportIcon />
                        </View>
                        <Text style={styles.menuText}>Help & Support</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>
                </View>


                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => {
                        setAlert({
                            visible: true,
                            type: 'warning',
                            title: 'Log Out',
                            message: 'Are you sure you want to log out?',
                            confirmText: 'Log Out',
                            cancelText: 'Cancel',
                            onConfirm: async () => {
                                try {
                                    await AsyncStorage.clear();
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Login' }],
                                    });
                                } catch (error) {
                                    console.error('Logout error:', error);
                                }
                            },
                        });
                    }}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>


                <CustomAlert
                    visible={alert.visible}
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    confirmText={alert.confirmText}
                    cancelText={alert.cancelText}
                    onConfirm={alert.onConfirm}
                    onCancel={() => setAlert({ ...alert, visible: false })}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FBF1CC',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },

    profileCard: {
        // backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        alignItems: 'center',

    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        // marginRight: 16,
    },
    profileName: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '700',
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 4,
    },
    registeredBadge: {
        backgroundColor: '#22c55e',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 20,
    },
    registeredText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
        marginBottom: 8,
        paddingLeft: 4,
    },
    menuItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        marginVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        // padding: 16,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        fontSize: 22,
        // width: 30,
        padding: 15,
        borderRadius: 50,
        backgroundColor: "#006E1C1A",
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    menuSubText: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    menuValue: {
        fontSize: 15,
        color: '#666',
        marginRight: 8,
    },
    chevron: {
        fontSize: 20,
        color: '#ccc',
    },
    logoutButton: {
        marginHorizontal: 30,
        marginTop: 30,
        flexDirection: "row",
        gap: 5,
        alignContent: "center",
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#B61723',
    },
    logoutText: {
        color: '#B61723',
        fontSize: 17,
        fontWeight: 'bold'
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 2,
    },
    navText: {
        fontSize: 12,
        color: '#666',
    },
});

export default Setting;