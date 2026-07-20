import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { RotateIcon, SplashIcon } from '../../utils/svgs/CommonSvgs';

const Onboarding = ({ navigation }) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 3000, // 3 seconds
            easing: Easing.linear,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                navigation.replace('Slider');
            }
        });
    }, []);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <SplashIcon />

                <Text style={styles.heading}>Fortphone</Text>

                <Text style={styles.subheading}>
                    NEXT-GEN VOICE CONNECTIVITY
                </Text>
            </View>

            <View style={styles.bottomContainer}>
                <View style={styles.progressBackground}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressWidth,
                            },
                        ]}
                    />
                </View>

                <View style={styles.loadingContainer}>
                    <RotateIcon />
                    <Text style={styles.loadingText}>
                        Optimizing secure channel...
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    heading: {
        marginTop: 20,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
    },

    subheading: {
        marginTop: 8,
        fontSize: 16,
        fontWeight:'bold',
        color: '#666',
        letterSpacing: 1,
    },

    bottomContainer: {
        width: '85%',
        marginBottom: 30,
        alignItems: 'center',
    },

    progressBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E5E5',
        borderRadius: 20,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 20,
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
    },

    loadingText: {
        marginLeft: 6,
        fontSize: 15,
        color: '#4CAF50',
        fontWeight: '600',
    },
});

export default Onboarding;