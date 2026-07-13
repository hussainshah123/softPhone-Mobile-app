import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RocketIcon, AddFreeIcon, PriorityIcon } from '../../utils/svgs/CommonSvgs';
import { SafeAreaView } from 'react-native-safe-area-context';

const UpgradeToPremium = () => {
  const navigation = useNavigation();

  const features = [
    {
      icon: <RocketIcon />,
      title: 'Unlimited Encrypted Calls',
      description: 'Make secure calls with end-to-end encryption',
    },
    {
      icon: <AddFreeIcon />,
      title: 'Ad-free Experience',
      description: 'Enjoy uninterrupted calling without ads',
    },
    {
      icon: <PriorityIcon />,
      title: 'Priority Support',
      description: 'Get 24/7 premium customer support',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Pricing Card */}
        <LinearGradient
          colors={['#94F990', '#4CAF50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pricingCard}
        >
          <Text style={styles.pricingTitle}>Premium Subscription</Text>
          <Text style={styles.pricingDescription}>
            Unlock all features for a seamless experience.
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$9.99</Text>
            <Text style={styles.period}>/month</Text>
          </View>
        </LinearGradient>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you get</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity style={styles.subscribeButton}>
          <LinearGradient
            colors={['#4CAF50', '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscribeButtonGradient}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms Text */}
        <Text style={styles.termsText}>
          Cancel anytime. Terms apply.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF1CC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#006E1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  headerSpacer: {
    width: 40,
  },
  pricingCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  pricingDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  period: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 4,
    opacity: 0.9,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  subscribeButton: {
    margin: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  termsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default UpgradeToPremium;
