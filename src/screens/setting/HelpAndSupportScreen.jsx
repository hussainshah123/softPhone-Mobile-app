import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { BackIcon, SearchIcon, EmailIcon, ChatIcon, RightArrowIcon, MailIcon, DownArrowIcon } from '../../utils/svgs/CommonSvgs';
import Header from '../../components/Header';

const HelpAndSupportScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        { id: 1, question: 'How to configure SIP?' },
        { id: 2, question: 'Improving call quality' },
        { id: 3, question: 'Billing & Premium' },
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleEmailSupport = () => {
        console.log('Opening email support...');
    };

    const handleLiveChat = () => {
        console.log('Opening live chat...');
    };

    return (
        <View style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#F4FBF1CC" /> */}
            <Header
                title="Help & Support"
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
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchIcon width={20} height={20} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search for help..."
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Frequently Asked Questions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={styles.faqItem}
                            onPress={() => toggleFaq(faq.id)}
                        >
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <DownArrowIcon
                                width={12}
                                height={12}
                                style={[
                                    styles.faqArrow,
                                    expandedFaq === faq.id && styles.faqArrowRotated
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contact Us */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>

                    <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
                        <View style={styles.contactIcon}>
                            <MailIcon />
                        </View>
                        <Text style={styles.contactButtonText}>Email Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatbutton} onPress={handleLiveChat}>
                        <View style={styles.contactIcon}>
                            <ChatIcon />
                        </View>
                        <Text style={styles.contactButtonText2}>Live Chat</Text>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <Text style={styles.versionText}>App Version 2.4.1 (Build 890)</Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    section: {
        marginTop: 24,
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderColor: '#006E1C',
        borderWidth: 0.2,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 22,
        // fontWeight: '700',
        fontWeight: 'bold',
        color: '#006E1C',
        marginBottom: 16,
    },
    faqItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 10,
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        // borderRadius: 10,
        // borderWidth: 1,
        // borderColor: '#E0E0E0',
    },
    faqQuestion: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    faqArrow: {
        transition: 'transform 0.3s',
    },
    faqArrowRotated: {
        transform: [{ rotate: '90deg' }],
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#006E1C',
        paddingVertical: 6,
        paddingHorizontal: 70,
        marginBottom: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: '#006E1C1A',
        justifyContent: 'center',
        alignItems: 'center',
        // marginRight: 6,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    chatbutton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        // backgroundColor: '#006E1C',
        paddingVertical: 6,
        paddingHorizontal: 80,
        marginBottom: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#006E1C',
    },
    contactButtonText2: {
        fontSize: 16,
        fontWeight: '600',
        color: '#006E1C',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#999',
        marginTop: 30,
        marginBottom: 10,
    },
});

export default HelpAndSupportScreen;
