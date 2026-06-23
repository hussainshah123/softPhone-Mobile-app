import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { CallIcon, DeleteIcon, MicIcon, PasueIcon, ResumeIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';

const voicemails = [
    {
        id: '1',
        name: 'Eleanor Vance',
        avatar: 'https://i.pravatar.cc/150?img=1',
        time: '10:42 AM',
        subtitle: 'Mobile • Today',
        duration: '0:45',
        transcript: "Hey, it's Eleanor. Just calling to confirm our meeting at 2 PM tomorrow. Let me know if...",
        isPlaying: true,
    },
    {
        id: '2',
        name: '+1 (555) 019-8372',
        avatar: null,
        time: 'Yesterday',
        subtitle: 'Unknown • 4:15 PM',
        duration: '1:12',
        transcript: "Hi, this is a message from the pharmacy regarding your prescription. It is now ready...",
        isPlaying: false,
    },
    {
        id: '3',
        name: 'Marketing Team',
        avatar: 'https://i.pravatar.cc/150?img=5',
        time: 'Oct 24',
        subtitle: 'Work • 11:30 AM',
        duration: '0:28',
        transcript: "Just a quick reminder about the all-hands meeting at noon. We'll be discussing the new...",
        isPlaying: false,
    },
];

const VoiceMail = () => {
    const renderVoicemail = ({ item }) => (
        <View style={styles.voicemailCard}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playIcon}>{item.isPlaying ? <PasueIcon fill={'white'} /> : <ResumeIcon fill={"white"} />}</Text>
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subtitle}>
                        {item.subtitle} • {item.time}
                    </Text>
                </View>

                <Text style={styles.duration}>{item.duration}</Text>
            </View>

            {/* Waveform */}
            <View style={styles.waveform}>
                <Text style={styles.waveText}>📊</Text>
            </View>

            {/* Transcript */}
            <View style={styles.transcriptContainer}>
                <Text style={styles.transcript}>{item.transcript}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                    <CallIcon fill={'#5B403E'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <DeleteIcon />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Voicemail"
                titleStyle={{
                    color: '#B61723',
                    textAlign: 'left',
                }}
                containerStyle={{ marginTop: 20 }}
                leftComponent={
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                        style={styles.headerAvatar}
                    />
                }
                rightComponent={<MicIcon />}
            />

            {/* Voicemail List */}
            <FlatList
                data={voicemails}
                keyExtractor={(item) => item.id}
                renderItem={renderVoicemail}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ff3b5c',
    },
    micIcon: {
        fontSize: 26,
    },
    listContent: {
        padding: 16,
    },
    voicemailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#B61723',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    playIcon: {
        fontSize: 22,
        color: '#fff',
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    duration: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ff3b5c',
    },
    waveform: {
        height: 40,
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    waveText: {
        fontSize: 18,
        opacity: 0.7,
    },
    transcriptContainer: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    transcript: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
    },
    actionButton: {
        padding: 8,
    },
    actionIcon: {
        fontSize: 24,
    },
});

export default VoiceMail;