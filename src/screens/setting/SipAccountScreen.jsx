import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SaveIcon, EyeOpenIcon, EyeCloseIcon, BackIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';
import firebaseService from '../../services/firebaseService';
import CustomAlert from '../../components/CustomAlert';

const SipAccountScreen = ({ navigation }) => {
    const [sipId, setSipId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [serverUrl, setServerUrl] = useState('');
    const [port, setPort] = useState('');
    const [transport, setTransport] = useState('UDP');
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: '',
        confirmText: 'OK',
        onConfirm: null,
    });

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        try {
            setLoading(true);
            const credentials = await firebaseService.getLocalSIPCredentials();

            if (credentials) {
                setSipId(credentials.username || '');
                setServerUrl(credentials.server || '');
                setPort(credentials.port || '');
                setPassword(credentials.password || '');
                console.log('[SipAccountScreen] Credentials loaded:', credentials);
            } else {
                console.log('[SipAccountScreen] No credentials found');
            }
        } catch (error) {
            console.error('[SipAccountScreen] Error loading credentials:', error);
            setAlert({
                visible: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to load SIP credentials',
                confirmText: 'OK',
                onConfirm: () => setAlert({ ...alert, visible: false }),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const userId = await firebaseService.getStoredUserId();

            if (!userId) {
                setAlert({
                    visible: true,
                    type: 'error',
                    title: 'Error',
                    message: 'No user session found. Please log in again.',
                    confirmText: 'OK',
                    onConfirm: () => {
                        setAlert({ ...alert, visible: false });
                        navigation.goBack();
                    },
                });
                return;
            }

            const updatedCredentials = {
                username: sipId,
                password: password,
                server: serverUrl,
                port: port,
            };

            await firebaseService.saveSIPCredentials(userId, updatedCredentials);

            setAlert({
                visible: true,
                type: 'success',
                title: 'Success',
                message: 'SIP credentials updated successfully',
                confirmText: 'OK',
                onConfirm: () => {
                    setAlert({ ...alert, visible: false });
                    navigation.goBack();
                },
            });
        } catch (error) {
            console.error('[SipAccountScreen] Error saving credentials:', error);
            setAlert({
                visible: true,
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to save credentials',
                confirmText: 'OK',
                onConfirm: () => setAlert({ ...alert, visible: false }),
            });
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#006E1C" />
                <Text style={styles.loadingText}>Loading credentials...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#F4FBF1CC" /> */}
            <Header
                title="SIP Account"
                titleStyle={{
                    color: 'white',
                    textAlign: 'center',
                }}
                containerStyle={{ marginTop: 20 }}
                leftComponent={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <BackIcon fill="white"/>
                    </TouchableOpacity>
                }
                rightComponent={
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                        style={styles.headerAvatar}
                    />
                }
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Credentials Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Credentials</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>SIP ID / Email</Text>
                        <TextInput
                            style={styles.input}
                            value={sipId}
                            onChangeText={setSipId}
                            placeholder="Enter SIP ID or Email"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Enter display name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOpenIcon width={20} height={20} />
                                ) : (
                                    <EyeCloseIcon width={20} height={20} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Server Configuration Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Server Configuration</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>SIP Server URL</Text>
                        <TextInput
                            style={styles.input}
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            placeholder="Enter SIP server URL"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.portinput}>


                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Port</Text>
                            <TextInput
                                style={styles.input}
                                value={port}
                                onChangeText={setPort}
                                placeholder="Enter port"
                                placeholderTextColor="white"
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.udpcontainer}>
                            <Text style={styles.label}>Transport</Text>
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownText}>{transport}</Text>
                                {/* <Text style={styles.dropdownArrow}>▼</Text> */}
                            </View>
                        </View>
                    </View>

                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <SaveIcon width={20} height={20} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>

            <CustomAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                confirmText={alert.confirmText}
                onConfirm={alert.onConfirm}
                onCancel={() => setAlert({ ...alert, visible: false })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#006E1C',
        fontWeight: '500',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderWidth:1,
        borderColor:"white",
        borderRadius: 16,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    backText: {
        fontSize: 16,
        color: '#B61723',
        fontWeight: '600',
    },
    section: {
        marginTop: 20,
        backgroundColor: '#1F1F1F',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderColor: '#006E1C',
        borderWidth: 0.2,
        borderRadius: 10,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
        marginBottom: 16,
    },
    portinput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    inputContainer: {
        flex: 1,
        
        marginBottom: 16,
    },
    udpcontainer: {
        flex: 1,
        
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9b9898',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#6F6E6D66',
        borderRadius: 25,
        color:'white',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 0.5,
        borderColor: '#006E1C',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#fff',
        backgroundColor:'#6F6E6D66',

        borderRadius: 25,
        borderWidth: 0.5,
        borderColor: '#006E1C',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    eyeIcon: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownContainer: {
        backgroundColor:'#6F6E6D66',
        
        borderRadius: 25,
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#006E1C',
    },
    dropdownText: {
        fontSize: 16,
        color: '#e6dddd',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#999',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#22c55e',
        marginHorizontal: 16,
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 25,
        gap: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SipAccountScreen;
