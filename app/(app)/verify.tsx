import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldCheck, BadgeCheck, AlertCircle, ExternalLink } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const theme = Colors.light;

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStartVerification = async () => {
    if (!currentUser) return;
    
    setIsRedirecting(true);
    try {
      // Point to our secure web verification portal
      const verificationUrl = `https://get-verified.unimart.com.ng?uid=${currentUser.id}`;
      
      // Use openURL directly as supported check can be flaky on some dev environments
      await Linking.openURL(verificationUrl);
      
      Alert.alert(
        'Opening Browser',
        'We are taking you to our secure verification portal to complete your identity check.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Verification redirect error:', error);
      Alert.alert('Error', 'Could not open the verification page. Please try again later.');
    } finally {
      setIsRedirecting(false);
    }
  };

    const benefits = [

      {

        title: 'Verified Badge',

        desc: 'Get a blue tick next to your name to stand out.',

        icon: <BadgeCheck size={24} color={theme.primary} />

      },

      {

        title: 'Trust & Safety',

        desc: 'Buyers are significantly more likely to buy from verified sellers.',

        icon: <ShieldCheck size={24} color={theme.primary} />

      },

      {

        title: 'Unlimited Listings',

        desc: 'Post as many items as you want without restrictions.',

        icon: <CheckCircle2 size={24} color={theme.primary} />

      }

    ];

  

    return (

      <View style={[styles.container, { backgroundColor: theme.background }]}>

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>

            <ArrowLeft size={24} color={theme.text} />

          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Verification</Text>

          <View style={{ width: 24 }} />

        </View>

  

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.heroSection}>

            <View style={[styles.badgeContainer, { backgroundColor: theme.secondaryBackground }]}>

              <BadgeCheck size={64} color={theme.primary} />

            </View>

            <Text style={[styles.title, { color: theme.text }]}>Verify Identity</Text>

                      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>

                        Join our trusted community of local vendors and unlock exclusive benefits.

                      </Text>

            

          </View>

  

          <View style={styles.benefitsContainer}>

            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>Why verify?</Text>

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

          <View style={[styles.infoBox, { backgroundColor: '#F0F7FF' }]}>

              <AlertCircle size={20} color={theme.primary} />

              <Text style={[styles.infoText, { color: '#0056B3' }]}>

                  You will be redirected to our secure web portal to complete your identity check.

              </Text>

          </View>

  

          <TouchableOpacity 

            style={[styles.submitButton, { backgroundColor: theme.primary }, isRedirecting && { opacity: 0.7 }]}

            onPress={handleStartVerification}

            disabled={isRedirecting}

          >

            {isRedirecting ? (

              <ActivityIndicator color="white" />

            ) : (

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                  <Text style={styles.submitButtonText}>Begin Verification</Text>

                  <ExternalLink size={20} color="white" />

              </View>

            )}

          </TouchableOpacity>

          

          <Text style={[styles.footerText, { color: theme.mutedText }]}>

              Verification typically takes 24-48 hours.

          </Text>

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

    badgeContainer: { width: 100, height: 100, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },

    title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },

    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },

  

    benefitsContainer: { marginBottom: 32 },

    sectionTitle: { fontSize: 18, fontWeight: '700' },

    benefitCard: { flexDirection: 'row', padding: 16, borderRadius: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },

    benefitIcon: { marginRight: 16 },

    benefitText: { flex: 1 },

    benefitTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },

    benefitDesc: { fontSize: 14, lineHeight: 20 },

  

    infoBox: { flexDirection: 'row', padding: 16, borderRadius: 12, gap: 12, marginBottom: 32 },

    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  

    submitButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' },

    submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },

    footerText: { textAlign: 'center', marginTop: 16, fontSize: 12, fontWeight: '500' },

  });

  