import React, { useEffect, useRef } from 'react';
import { StatusBar, StyleSheet, Text, Animated, Easing, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HeadphoneIcon, SplashIcon } from '../../utils/svgs/CommonSvgs';
import firebaseService from '../../services/firebaseService';

const Splash = ({ navigation }) => {
    // Entrance: fade + scale-in. Then a continuous gentle pulse.
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0.4)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslate = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Icon entrance (fade + spring scale)
        Animated.parallel([
            Animated.timing(iconOpacity, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 5,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Continuous gentle pulse once the icon has settled
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.08,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });

        // Text fades/slides in slightly after the icon
        Animated.parallel([
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 700,
                delay: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(textTranslate, {
                toValue: 0,
                duration: 700,
                delay: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [iconOpacity, iconScale, pulse, textOpacity, textTranslate]);

    useEffect(() => {
        const checkAuthAndNavigate = async () => {
            try {
                const isAuthenticated = await firebaseService.isUserAuthenticated();

                if (isAuthenticated) {
                    console.log('[Splash] User authenticated, navigating to BottomTabs');
                    navigation.replace('BottomTabs');
                } else {
                    console.log('[Splash] User not authenticated, navigating to Onboarding');
                    navigation.replace('Onboarding');
                }
            } catch (error) {
                console.error('[Splash] Error checking authentication:', error);
                navigation.replace('Onboarding');
            }
        };

        const timer = setTimeout(checkAuthAndNavigate, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View
            // colors={['#7ED957', '#4CAF50']}
            // start={{ x: 0.5, y: 0 }}
            // end={{ x: 0.5, y: 1 }}
            style={styles.container}
        >
            {/* <StatusBar barStyle="dark-content" backgroundColor="##000000" /> */}

            <Animated.View
                style={{
                    opacity: iconOpacity,
                    transform: [{ scale: Animated.multiply(iconScale, pulse) }],
                }}
            >
                <SplashIcon />
            </Animated.View>

            <Animated.View
                style={{
                    opacity: textOpacity,
                    transform: [{ translateY: textTranslate }],
                    alignItems: 'center',
                }}
            >
                <Text style={styles.heading}>Fortphone</Text>

                <Text style={styles.subheading}>
                    Crystal Clear Calls, Anywhere
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#000000'
    },
    heading: {
        marginTop: 20,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subheading: {
        marginTop: 8,
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default Splash;
