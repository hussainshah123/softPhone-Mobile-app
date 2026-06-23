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
import { AboutIcon, ConfrenceCall, DoNotDistrubIcon, HelpIcon, KeyIcon, LogoutIcon, NotificationIcon, RightArrowIcon, RingIcon, VoiceMailIcon, VolumIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';

const Setting = () => {
    const [isDND, setIsDND] = useState(true);

    return (
        <View style={styles.container}>
            <Header
                title="Softphone"
                titleStyle={{
                    color: '#B61723',
                    textAlign: 'left',
                }}
                containerStyle={{ marginTop: 20 }}
                leftComponent={
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                        style={styles.headerAvatar}
                    />
                }
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
                        <View style={styles.registeredBadge}>
                            <Text style={styles.registeredText}>Registered</Text>
                        </View>
                    </View>
                </View>

                {/* ACCOUNT Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <ConfrenceCall />

                        </View>
                        <Text style={styles.menuText}>Call Forwarding</Text>
                        <Text style={styles.menuValue}>Off</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />

                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <VoiceMailIcon />

                        </View>
                        <Text style={styles.menuText}>Voicemail</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <KeyIcon />
                        </View>
                        <Text style={styles.menuText}>SIP Credentials</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* PREFERENCES Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREFERENCES</Text>

                    <View style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <DoNotDistrubIcon />
                        </View>
                        <Text style={styles.menuText}>Do Not Disturb</Text>
                        <Text style={styles.menuSubText}>Silence incoming calls</Text>
                        <Switch
                            value={isDND}
                            onValueChange={setIsDND}
                            trackColor={{ false: '#ccc', true: '#B61723' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <RingIcon />
                        </View>
                        <Text style={styles.menuText}>Ringtone</Text>
                        <Text style={styles.menuValue}>Classic Synth</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <VolumIcon />
                        </View>
                        <Text style={styles.menuText}>Audio & Devices</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>
                </View>
                {/* APP Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APP</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <AboutIcon />
                        </View>
                        <Text style={styles.menuText}>About</Text>
                        <Text style={styles.menuValue}>v2.4.1</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <HelpIcon />
                        </View>
                        <Text style={styles.menuText}>Help & Support</Text>
                        <View style={styles.chevron}>
                            <RightArrowIcon />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Log Out Button */}
                <TouchableOpacity style={styles.logoutButton}>
                    <LogoutIcon />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                {/* Bottom Navigation */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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

    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },

    profileCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    profileAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
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
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        fontSize: 22,
        width: 30,
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
        marginHorizontal: 16,
        marginTop: 30,
        flexDirection: "row",
        gap: 5,
        alignContent: "center",
        // alignSelf:'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#B61723',
    },
    logoutText: {
        color: '#B61723',
        fontSize: 17,
        fontWeight: '600',
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