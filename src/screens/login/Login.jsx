import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { EyeOpenIcon, EyeCloseIcon, SipIcon, LoginIcon, SpeakerIcon, SplashIcon, InvolopIcon, UrlIcon, PortIcon, LockIcon, RightIcon } from '../../utils/svgs/CommonSvgs'
import { registerSIP } from '../../services/sipService'
import CustomAlert from '../../components/CustomAlert'
import firebaseService from '../../services/firebaseService'

const Login = ({ navigation }) => {
    const [formData, setFormData] = useState({
        sipUsername: '',
        sipPassword: '',
        sipServer: '',
        port: '',
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: '',
        confirmText: 'OK',
        onConfirm: null,
    })

    const validateForm = () => {
        const newErrors = {}
        if (!formData.sipUsername.trim()) {
            newErrors.sipUsername = 'SIP Username is required'
        }
        if (!formData.sipPassword.trim()) {
            newErrors.sipPassword = 'SIP Password is required'
        }
        if (!formData.sipServer.trim()) {
            newErrors.sipServer = 'SIP Server URL is required'
        }
        if (!formData.port.trim()) {
            newErrors.port = 'Port Number is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async () => {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        console.log('[SIP] Login attempt started', {
            username: formData.sipUsername,
            server: formData.sipServer,
            port: formData.port,
        })

        try {
            const response = await registerSIP(
                formData.sipUsername,
                formData.sipPassword,
                formData.sipServer,
                formData.port
            )

            const credentials = {
                username: formData.sipUsername,
                password: formData.sipPassword,
                server: formData.sipServer,
                port: formData.port,
            }

            const userId = `${formData.sipUsername}_${Date.now()}`
            await firebaseService.saveSIPCredentials(userId, credentials)

            console.log('[SIP] Login successful:', response)
            setLoading(false)
            setAlert({
                visible: true,
                type: 'success',
                title: 'Registration Success',
                message: response,
                confirmText: 'OK',
                onConfirm: () => navigation.navigate('BottomTabs'),
            })
        } catch (error) {
            console.error('[SIP] Login failed:', error?.message || error)
            setLoading(false)
            setAlert({
                visible: true,
                type: 'error',
                title: 'Registration Failed',
                message: error?.message || 'Check your SIP server credentials and try again.',
                confirmText: 'Retry',
                onConfirm: () => setAlert({ ...alert, visible: false }),
            })
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>

                <View style={styles.iconContainer}>
                    <View style={styles.sipIcon}>
                        <SplashIcon />
                    </View>
                </View>

                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subheading}>Join ConnectSphere for seamless
                    connectivity.</Text>

                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.sipUsername && styles.inputError]}>
                        <InvolopIcon width={20} height={20} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Sip Username"
                            placeholderTextColor="#FFFFFF"
                            value={formData.sipUsername}
                            onChangeText={(text) => {
                                setFormData({ ...formData, sipUsername: text });
                                if (errors.sipUsername) {
                                    setErrors({ ...errors, sipUsername: '' });
                                }
                            }}
                        />
                    </View>

                    {errors.sipUsername && (
                        <Text style={styles.errorText}>{errors.sipUsername}</Text>
                    )}
                </View>



                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.sipServer && styles.inputError]}>
                        <UrlIcon width={20} height={20} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Sip Server URL"
                            placeholderTextColor="#FFFFFF"
                            value={formData.sipServer}
                            onChangeText={(text) => {
                                setFormData({ ...formData, sipServer: text });
                                if (errors.sipServer) {
                                    setErrors({ ...errors, sipServer: '' });
                                }
                            }}
                        />
                    </View>

                    {errors.sipServer && (
                        <Text style={styles.errorText}>{errors.sipServer}</Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.port && styles.inputError]}>
                        <PortIcon width={20} height={20} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Sip Port Number"
                            placeholderTextColor="#FFFFFF"
                            value={formData.port}
                            onChangeText={(text) => {
                                setFormData({ ...formData, port: text });
                                if (errors.port) {
                                    setErrors({ ...errors, port: '' });
                                }
                            }}
                        />
                    </View>

                    {errors.port && (
                        <Text style={styles.errorText}>{errors.port}</Text>
                    )}
                </View>
                {/* <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Remember Me</Text>
                    <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: '#DDD', true: '#B61723' }}
                        thumbColor={rememberMe ? '#FFFFFF' : '#FFFFFF'}
                    />
                </View> */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.sipPassword && styles.inputError]}>
                        <LockIcon width={20} height={20} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Sip Password"
                            placeholderTextColor="#FFFFFF"
                            secureTextEntry={!showPassword}
                            value={formData.sipPassword}
                            onChangeText={(text) => {
                                setFormData({ ...formData, sipPassword: text });
                                if (errors.sipPassword) {
                                    setErrors({ ...errors, sipPassword: '' });
                                }
                            }}
                        />

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOpenIcon width={22} height={20} />
                            ) : (
                                <EyeCloseIcon width={20} height={20} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {errors.sipPassword && (
                        <Text style={styles.errorText}>{errors.sipPassword}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.buttonText}>Login</Text>
                            <View style={styles.arrow}>
                                <RightIcon />
                            </View>
                        </>
                    )}
                </TouchableOpacity>
                <View style={styles.para}>
                    <Text style={styles.txt}>By signing up, you agree to
                        ConnectSphere's Terms of Service and
                        Privacy Policy.</Text>
                </View>
            </View>

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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: "#000000",

    },
    innerContainer: {
        // backgroundColor: '#FFFFFF',

        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
        
    },
    sipIcon: {
        width: 60,
        height: 60,
        // backgroundColor: '#F0F3FF',
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sipIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color:'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#363636',
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 15,
        marginVertical: 10,
    },

    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 10,
    },
    subheading: {
        fontSize: 14,
        color: '#6F7A6B',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor:'red',
        // borderWidth: 1,
        // marginVertical: 10,
        // backgroundColor: "#363636",
        // borderColor: '#DDD',
        borderRadius: 25,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#B61723',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
    },
    errorText: {
        color: '#B61723',
        fontSize: 12,
        marginTop: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    switchLabel: {
        fontSize: 14,
        color: '#333',
    },
    button: {
        width: '100%',
        height: 50,
        marginTop: 30,
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    arrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    para:{
        marginTop:20,
        justifyContent:'center',
        alignItems:'center'

    },
    txt:{
        color:'#6F7A6B',
        alignItems:'center',
        textAlign:'center'
    }
})

export default Login