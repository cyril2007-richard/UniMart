import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldCheck, Upload, UserCheck, BadgeCheck, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, setVerified } = useAuth();
  const theme = Colors.light;

  const [idImage, setIdImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickIdImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!idImage) {
      Alert.alert('ID Required', 'Please upload a photo of your Student ID card.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentUser) {
        // In a real app, we would upload the image to storage and set a 'pending' status.
        // For this demo, we'll just set verified to true directly.
        await setVerified(currentUser.id, true);
        
        Alert.alert(
          'Verification Submitted',
          'Your verification request has been received. You now have a verified badge!',
          [{ text: 'Great!', onPress: () => router.replace('/(app)/(tabs)/profile') }]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      title: 'Verified Badge',
      desc: 'Get a blue tick next to your name to stand out.',
      icon: <BadgeCheck size={24} color={theme.purple} />
    },
    {
      title: 'Trust & Safety',
      desc: 'Buyers are 3x more likely to buy from verified sellers.',
      icon: <ShieldCheck size={24} color={theme.purple} />
    },
    {
      title: 'Unlimited Listings',
      desc: 'Post as many items as you want without restrictions.',
      icon: <CheckCircle2 size={24} color={theme.purple} />
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Get Verified</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.badgeContainer, { backgroundColor: theme.lightPurple }]}>
            <BadgeCheck size={64} color={theme.purple} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Verify Your Identity</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Join our trusted community of student sellers and unlock exclusive benefits.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={[styles.benefitCard, { backgroundColor: theme.surface }]}>
              <View style={styles.benefitIcon}>{benefit.icon}</View>
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: theme.text }]}>{benefit.title}</Text>
                <Text style={[styles.benefitDesc, { color: theme.secondaryText }]}>{benefit.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.uploadSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upload Student ID</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
            Ensure your name and matric number are clearly visible.
          </Text>

          <TouchableOpacity 
            style={[
              styles.uploadBox, 
              { backgroundColor: theme.surface, borderColor: theme.purple, borderStyle: idImage ? 'solid' : 'dashed' }
            ]}
            onPress={pickIdImage}
          >
            {idImage ? (
              <Image source={{ uri: idImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Upload size={32} color={theme.purple} />
                <Text style={[styles.uploadText, { color: theme.purple }]}>Tap to Upload ID</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: '#FFF9E6' }]}>
            <AlertCircle size={20} color="#FFB800" />
            <Text style={[styles.infoText, { color: '#856404' }]}>
                Verification typically takes 24-48 hours. You will be notified once approved.
            </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.purple }, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  heroSection: { alignItems: 'center', marginBottom: 32 },
  badgeContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },

  benefitsContainer: { marginBottom: 32 },
  benefitCard: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  benefitIcon: { marginRight: 16 },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  benefitDesc: { fontSize: 14 },

  uploadSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, marginBottom: 16 },
  uploadBox: { height: 200, borderRadius: 16, borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { marginTop: 8, fontWeight: '600' },

  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 12, gap: 12, marginBottom: 32 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  submitButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
