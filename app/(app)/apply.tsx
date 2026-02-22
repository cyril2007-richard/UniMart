import { useRouter } from 'expo-router';
import { ArrowRight, Bike, Check, ChevronLeft, Zap, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function ApplyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  const handleRiderSignup = () => {
    Linking.openURL('https://get-verified.unimart.com.ng/rider/signup');
  };

  const requirements = [
    'A bicycle or scooter in good condition',
    'A valid ID card',
    'Smartphone with data connection',
    'Friendly and reliable attitude'
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Earn Locally</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIconCircle, { backgroundColor: theme.secondaryBackground }]}>
            <Bike size={48} color={theme.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Become a Rider</Text>
          <Text style={[styles.heroSubtitle, { color: theme.secondaryText }]}>
            Deliver items in your local area on your own schedule and get paid instantly.
          </Text>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What You Need</Text>
          <View style={styles.requirementsGrid}>
            {requirements.map((req, index) => (
              <View key={index} style={[styles.reqCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: '#F1F5F9' }]}>
                <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                    <Check size={14} color="white" strokeWidth={2.5} />
                </View>
                <Text style={[styles.reqText, { color: theme.text }]}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Process Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How It Works</Text>
          <View style={[styles.processCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: '#F1F5F9' }]}>
             <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.secondaryBackground }]}><Text style={[styles.stepNumText, { color: theme.text }]}>1</Text></View>
                <Text style={[styles.stepText, { color: theme.text }]}>Submit application</Text>
             </View>
             <View style={styles.stepLine} />
             <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.secondaryBackground }]}><Text style={[styles.stepNumText, { color: theme.text }]}>2</Text></View>
                <Text style={[styles.stepText, { color: theme.text }]}>Verify ID in 24hrs</Text>
             </View>
             <View style={styles.stepLine} />
             <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.secondaryBackground }]}><Text style={[styles.stepNumText, { color: theme.text }]}>3</Text></View>
                <Text style={[styles.stepText, { color: theme.text }]}>Start earning</Text>
             </View>
          </View>
        </View>

        {/* Trust Badge */}
        <View style={[styles.trustBadge, { backgroundColor: 'rgba(22, 163, 74, 0.05)' }]}>
            <ShieldCheck size={18} color="#16A34A" />
            <Text style={styles.trustText}>Secure Payments & Verified IDs</Text>
        </View>

      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: theme.primary }]} 
          activeOpacity={0.9}
          onPress={handleRiderSignup}
        >
          <Zap color="white" size={20} fill="white" />
          <Text style={styles.applyButtonText}>Initialize Accreditation</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for footer
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },

  // Sections
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  // Requirements Grid
  requirementsGrid: {
    gap: 12,
  },
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reqText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // Process Steps
  processCard: {
    padding: 20,
    borderRadius: 20,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginLeft: 14, // Center with circle
    marginVertical: 4,
  },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'center',
  },
  trustText: {
    color: '#27ae60',
    fontWeight: '600',
    fontSize: 13,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});