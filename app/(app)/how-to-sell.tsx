import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronLeft,
  PackagePlus,
  ShieldCheck
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function HowToSellScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      title: 'Get Verified',
      description: 'Ensure your profile is verified. This builds trust and increases your visibility to buyers.',
      icon: ShieldCheck,
      color: '#16A34A' // Success Green
    },
    {
      title: 'Create a Listing',
      description: 'Tap the "+" button. Upload clear photos and set a fair price for your item.',
      icon: PackagePlus,
      color: theme.primary // Primary Blue
    },
    {
      title: 'Add Details',
      description: 'Write a clear description including condition, specs, and any defects.',
      icon: Camera,
      color: '#F59E0B' // Warning Orange
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Seller Guide</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIconCircle, { backgroundColor: theme.secondaryBackground }]}>
            <BadgeCheck size={48} color={theme.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Start Selling</Text>
          <Text style={[styles.heroSubtitle, { color: theme.secondaryText }]}>
            Post your items on UniMart and reach thousands of people instantly.
          </Text>
        </View>

        {/* Timeline Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = step.icon;
            
            return (
              <View key={index} style={styles.stepRow}>
                {/* Timeline Column */}
                <View style={styles.timelineColumn}>
                  <View style={[styles.timelineDot, { backgroundColor: step.color }]}>
                    <Icon size={16} color="white" />
                  </View>
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.secondaryBackground }]} />}
                </View>

                {/* Content Column */}
                <View style={[styles.stepContent, { paddingBottom: isLast ? 0 : 32 }]}>
                  <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: theme.secondaryText }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.ctaButton, { backgroundColor: theme.primary }]} 
          activeOpacity={0.9}
          onPress={() => router.navigate('/(app)/add')} 
        >
          <Text style={styles.ctaButtonText}>List an Item</Text>
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
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
  },

  // Timeline
  stepsContainer: {
    paddingLeft: 10,
  },
  stepRow: {
    flexDirection: 'row',
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 20,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -4, // tuck under dot
    marginBottom: -4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4, // Align with dot
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
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
  ctaButton: {
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
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});