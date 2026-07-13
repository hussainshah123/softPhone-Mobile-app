import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Switch,
} from 'react-native';
import { BackIcon, WifiIcon, LatencyIcon, JitterIcon, PacketLossIcon, NetIcon, LetencyIcon, PacketIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';

const CallQualityScreen = ({ navigation }) => {
    const [ecoMode, setEcoMode] = useState(false);
    const [hdVoice, setHdVoice] = useState(true);

    const handleTestConnection = () => {
        console.log('Testing connection...');
    };

    return (
        <View style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#F4FBF1CC" /> */}
            <Header
                title="Call Quality"
                titleStyle={{
                    color: 'black',
                    textAlign: 'center',
                }}
                containerStyle={{ marginTop: 20 }}
                leftComponent={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <BackIcon />
                    </TouchableOpacity>
                }
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Current Status Section */}
                <View style={styles.statuscontainer}>
                    <Text style={styles.status}>CURRENT STATUS</Text>
                    <View style={styles.statusSection}>
                        <View style={styles.statusCircle}>
                            <NetIcon width={40} height={40} />
                        </View>
                        <Text style={styles.statusTitle}>Excellent</Text>
                        <Text style={styles.statusDescription}>
                            Your connection is optimal for HD Voice and Video.
                        </Text>
                    </View>
                </View>


                {/* Metrics Section */}
                <View style={styles.metricsSection}>
                    <View style={styles.metricItem}>
                        <View style={styles.metricIcon}>
                            <LetencyIcon />
                        </View>
                        <Text style={styles.metricLabel}>Latency</Text>

                        <View style={styles.metricInfo}>
                            <Text style={styles.metricValue}>24 ms</Text>
                        </View>
                    </View>

                    <View style={styles.metricItem}>
                        <View style={styles.metricIcon}>
                            <JitterIcon />
                        </View>
                        <Text style={styles.metricLabel}>Jitter</Text>
                        <View style={styles.metricInfo}>

                            <Text style={styles.metricValue}>2 ms</Text>
                        </View>
                    </View>

                    <View style={styles.metricItem}>
                        <View style={styles.metricIcon}>
                            <PacketIcon />

                        </View>
                        <Text style={styles.metricLabel}>Packet Loss</Text>
                        <View style={styles.metricInfo}>
                            <Text style={styles.metricValue}>0.0 %</Text>
                        </View>
                    </View>
                </View>

                {/* Toggle Section */}
                <View style={styles.toggleSection}>
                    <View style={styles.toggleItem}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Eco Mode</Text>
                            <Text style={styles.toggleDescription}>
                                Reduces data usage and battery drain
                            </Text>
                        </View>
                        <Switch
                            value={ecoMode}
                            onValueChange={setEcoMode}
                            trackColor={{ false: '#ccc', true: '#22c55e' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.toggleItem}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>HD Voice</Text>
                            <Text style={styles.toggleDescription}>
                                Prioritize crystal clear audio quality
                            </Text>
                        </View>
                        <Switch
                            value={hdVoice}
                            onValueChange={setHdVoice}
                            trackColor={{ false: '#ccc', true: '#22c55e' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Test Connection Button */}
                <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
                    <NetIcon width={20} height={20} />
                    <Text style={styles.testButtonText}>Test Connection</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FBF1CC',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    statuscontainer: {
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 10,
        paddingVertical: 10,
        backgroundColor: "white",
        borderColor: '#22c55e',
        borderWidth: 0.2
    },
    status: {
        textAlign: 'center'
    },
    statusSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    statusCircle: {
        width: 100,
        height: 100,
        borderWidth: 15,
        borderColor: '#22c55e',
        borderRadius: 50, // width/2
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    statusDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    metricsSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#006E1C1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    metricInfo: {
        alignItems: 'flex-end',
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,   // ye add karo
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    toggleSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    toggleInfo: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 13,
        color: '#666',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#22c55e',
        borderWidth: 1,
        // backgroundColor: '#22c55e',
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 25,
        gap: 10,
    },
    testButtonText: {
        color: '#22c55e',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CallQualityScreen;
