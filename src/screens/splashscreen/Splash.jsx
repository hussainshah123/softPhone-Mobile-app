import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HeadphoneIcon, SplashIcon } from '../../utils/svgs/CommonSvgs';

const Splash = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 3000);

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