import { useRouter } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  CreditCard,
  MessageCircle,
  Search,
  ShoppingBag
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

export default function HowToBuyScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      title: 'Find what you need',
      description: 'Browse categories or use the search bar to find textbooks, gadgets, and more.',
      icon: Search,
      color: '#3498db'
    },
    {
      title: 'Check the details',
      description: 'Tap on a product to view images, price, and description. Check seller reviews.',
      icon: ShoppingBag,
      color: '#9b59b6'
    },
    {
      title: 'Chat with Seller',
      description: 'Send a message to ask questions, negotiate price, or arrange a meetup.',
      icon: MessageCircle,
      color: '#e67e22'
    },
    {
      title: 'Payment & Delivery',
      description: 'Pay securely via the app and choose "Rider Delivery" or safe pickup.',
      icon: CreditCard,
      color: '#27ae60'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Guide</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIconCircle, { backgroundColor: theme.surface }]}>
            <ShoppingBag size={48} color={theme.purple} strokeWidth={1.5} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Shopping Made Easy</Text>
          <Text style={[styles.heroSubtitle, { color: theme.secondaryText }]}>
            Get the items you need on campus in just a few simple steps.
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
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.surface }]} />}
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
      <View style={[styles.footer, { backgroundColor: theme.background, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.ctaButton, { backgroundColor: theme.purple }]} 
          activeOpacity={0.8}
          onPress={() => router.navigate('/(app)/(tabs)/shop')}
        >
          <Text style={styles.ctaButtonText}>Start Shopping</Text>
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