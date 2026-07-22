import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const PremiumCard = () => {
    const navigation = useNavigation();
    return (
        <LinearGradient
            colors={['#F9F9FF', '#000000']}
            start={{ x: 0, y: 2 }}
            end={{ x: 2, y: 2 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Premium Call
                    </Text>

                    <Text style={styles.title}>
                        Plan
                    </Text>

                    <Text style={styles.subtitle}>
                        Unlimited HD voice & video
                    </Text>

                    <Text style={styles.subtitle}>
                        calls included
                    </Text>
                </View>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        HD Voice
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpgradeToPremium')}>
                <Text style={styles.buttonText}>
                    Upgrade Now
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

export default PremiumCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        padding: 18,
        marginBottom: 25,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: 'black',
    },

    subtitle: {
        fontSize: 13,
        color: 'black',
        marginTop: 2,
    },

    badge: {
        backgroundColor: 'black',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth:1,
        borderColor:'white',
        alignSelf: 'flex-start',
    },

    badgeText: {
        color: '#0EB438',
        fontWeight: '600',
        fontSize: 12,
    },

    button: {
        marginTop: 20,
        alignSelf: 'flex-start',
        backgroundColor: 'black',
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderWidth:1,
        borderColor:'white',
        borderRadius: 30,
    },

    buttonText: {
        color: '#69C443',
        fontWeight: '700',
    },
});