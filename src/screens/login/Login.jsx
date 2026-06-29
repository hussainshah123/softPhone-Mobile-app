import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { EyeOpenIcon, EyeCloseIcon, SipIcon, LoginIcon } from '../../utils/svgs/CommonSvgs'
import { registerSIP } from '../../services/sipService'

const Login = ({ navigation }) => {
    const [formData, setFormData] = useState({
        sipUsername: 'fortdice',
        sipPassword: 'fortdice@$',
        sipServer: '45.9.188.64',
        port: '5060',
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)

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
            console.log('[SIP] Login successful:', response)
            setLoading(false)
            Alert.alert('Registration Success', response, [
                { text: 'OK', onPress: () => navigation.navigate('BottomTabs') }
            ])
        } catch (error) {
            console.error('[SIP] Login failed:', error?.message || error)
            setLoading(false)
            Alert.alert('Registration Failed', error?.message || 'Check your SIP server credentials and try again.')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>

                <View style={styles.iconContainer}>
                    <View style={styles.sipIcon}>
                        <SipIcon />
                    </View>
                </View>

                <Text style={styles.heading}>Connect Your SIP Account</Text>
                <Text style={styles.subheading}>Enter your credentials to get started</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>SIP Username</Text>
                    <TextInput
                        style={[styles.input, errors.sipUsername && styles.inputError]}
                        placeholder="Usually your extension or email"
                        placeholderTextColor="#999"
                        value={formData.sipUsername}
                        onChangeText={(text) => {
                            setFormData({ ...formData, sipUsername: text })
                            if (errors.sipUsername) setErrors({ ...errors, sipUsername: '' })
                        }}
                    />
                    {errors.sipUsername && <Text style={styles.errorText}>{errors.sipUsername}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>SIP Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, styles.passwordInput, errors.sipPassword && styles.inputError]}
                            placeholder="Provided by your VoIP admin"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={formData.sipPassword}
                            onChangeText={(text) => {
                                setFormData({ ...formData, sipPassword: text })
                                if (errors.sipPassword) setErrors({ ...errors, sipPassword: '' })
                            }}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            {showPassword ? <EyeOpenIcon width={22} height={20} /> : <EyeCloseIcon width={22} height={20} />}
                        </TouchableOpacity>
                    </View>
                    {errors.sipPassword && <Text style={styles.errorText}>{errors.sipPassword}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>SIP Server URL</Text>
                    <TextInput
                        style={[styles.input, errors.sipServer && styles.inputError]}
                        placeholder="e.g., sip.yourcompany.com"
                        placeholderTextColor="#999"
                        value={formData.sipServer}
                        onChangeText={(text) => {
                            setFormData({ ...formData, sipServer: text })
                            if (errors.sipServer) setErrors({ ...errors, sipServer: '' })
                        }}
                    />
                    {errors.sipServer && <Text style={styles.errorText}>{errors.sipServer}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Port Number</Text>
                    <TextInput
                        style={[styles.input, errors.port && styles.inputError]}
                        placeholder="Default is 5060 for UDP/TCP"
                        placeholderTextColor="#999"
                        value={formData.port}
                        onChangeText={(text) => {
                            setFormData({ ...formData, port: text })
                            if (errors.port) setErrors({ ...errors, port: '' })
                        }}
                    />
                    {errors.port && <Text style={styles.errorText}>{errors.port}</Text>}
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Remember Me</Text>
                    <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: '#DDD', true: '#B61723' }}
                        thumbColor={rememberMe ? '#FFFFFF' : '#FFFFFF'}
                    />
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
                                <LoginIcon />
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: "#D3DAEA",

    },
    innerContainer: {
        backgroundColor: '#FFFFFF',

        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sipIcon: {
        width: 60,
        height: 60,
        backgroundColor: '#F0F3FF',
        borderRadius: 8,
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
        textAlign: 'center',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        color: '#666',
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
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 15,
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
        backgroundColor: '#B61723',
        borderRadius: 8,
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
})

export default Login