import { useRouter } from 'expo-router';
import { Bike, CheckCircle, ChevronLeft, Mail } from 'lucide-react-native';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function ApplyScreen() {
  const router = useRouter();
  const theme = Colors.light;

  const handleEmail = () => {
    Linking.openURL('mailto:riders@unimart.com?subject=Rider Application&body=Name:%0AStudent ID:%0AIntroduction:');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Become a Rider</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.lightPurple }]}>
            <Bike size={60} color={theme.purple} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Join our team!</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Deliver items across campus and earn money on your own schedule.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Requirements</Text>
          <View style={styles.requirementsList}>
            {[
              'A bicycle or scooter in good condition',
              'A valid student ID',
              'A smartphone with the UniMart app',
              'A friendly and reliable attitude'
            ].map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <CheckCircle size={20} color={theme.purple} />
                <Text style={[styles.requirementText, { color: theme.secondaryText }]}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How to Apply</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            To apply, please send an email to riders@unimart.com with your name, student ID, and a brief introduction.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: theme.purple }]} 
          activeOpacity={0.8}
          onPress={handleEmail}
        >
          <Mail color={theme.white} size={20} style={{ marginRight: 10 }} />
          <Text style={[styles.applyButtonText, { color: theme.white }]}>Send Application</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
