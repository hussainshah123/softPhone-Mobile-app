import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HeadphoneIcon, SplashIcon } from '../../utils/svgs/CommonSvgs';
import firebaseService from '../../services/firebaseService';

const Splash = ({ navigation }) => {
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
        <LinearGradient
            colors={['#7ED957', '#4CAF50']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.container}
        >
           <SplashIcon/>

            <Text style={styles.heading}>Fortphone</Text>

            <Text style={styles.subheading}>
                Crystal Clear Calls, Anywhere
            </Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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