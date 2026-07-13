import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'react-native-linear-gradient'

const CustomAlert = ({ visible, title, message, type, onConfirm, onCancel, confirmText, cancelText }) => {
    const getIconColor = () => {
        if (type === 'success') return '#4CAF50'
        if (type === 'error') return '#B61723'
        if (type === 'warning') return '#FF9800'
        return '#2196F3'
    }

    const getIcon = () => {
        const color = getIconColor()
        if (type === 'success') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.icon, { color }]}>✓</Text>
                </View>
            )
        }
        if (type === 'error') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.icon, { color }]}>✕</Text>
                </View>
            )
        }
        if (type === 'warning') {
            return (
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.icon, { color }]}>!</Text>
                </View>
            )
        }
        return (
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.icon, { color }]}>i</Text>
            </View>
        )
    }

    const getButtonColor = () => {
        if (type === 'success') return '#4CAF50'
        if (type === 'error') return '#B61723'
        if (type === 'warning') return '#FF9800'
        return '#2196F3'
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    {getIcon()}
                    
                    <Text style={styles.title}>{title}</Text>
                    
                    <Text style={styles.message}>{message}</Text>
                    
                    <View style={styles.buttonContainer}>
                        {cancelText && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: getButtonColor() }]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.buttonText}>{confirmText || 'OK'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default CustomAlert
