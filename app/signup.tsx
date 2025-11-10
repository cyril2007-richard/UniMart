import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
    matricNumber: '',
    faculty: '',
    phoneNumber: '',
  });
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { signup } = useAuth();

  const FAKE_OTP = '123456';

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    if (
      !formData.email ||
      !formData.name ||
      !formData.username ||
      !formData.password ||
      !formData.matricNumber ||
      !formData.faculty ||
      !formData.phoneNumber
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const allowedDomains = ['gmail.com', 'uniben.edu', 'eng.uniben.com'];
    const emailDomain = formData.email.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
      Alert.alert('Error', 'Only Gmail and UNIBEN student emails are allowed');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (formData.phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (otp === FAKE_OTP) {
      const success = signup({
        ...formData,
        profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
      });

      if (success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Error', 'Email or username already exists');
        setStep(1);
      }
    } else {
      Alert.alert('Error', 'Invalid OTP. Try 123456');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* === NOSTALGIC HEADER === */}
        <View style={styles.header}>
          <Text style={styles.logo}>UniMarket</Text>
          <Text style={styles.tagline}>Shop Smart. Sell Fast.</Text>
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.title}>Create your account</Text>

            {[
              { placeholder: 'Email', key: 'email', keyboard: 'email-address' },
              { placeholder: 'Full Name', key: 'name' },
              { placeholder: 'Username', key: 'username' },
              { placeholder: 'Password', key: 'password', secure: true },
              { placeholder: 'Matric Number', key: 'matricNumber' },
              { placeholder: 'Faculty', key: 'faculty' },
              { placeholder: 'Phone Number', key: 'phoneNumber', keyboard: 'phone-pad' },
            ].map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.placeholder}</Text>
                <TextInput
                  style={styles.input}
                  value={(formData as any)[field.key]}
                  onChangeText={(text) => updateFormData(field.key, text)}
                  keyboardType='default'
                  secureTextEntry={field.secure || false}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLinkText}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to:
            </Text>
            <Text style={styles.phone}>{formData.phoneNumber}</Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />

            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOTP}>
              <Text style={styles.verifyText}>Verify & Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={styles.backLink}>Back to Signup</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===========================================
// NOSTALGIC 2000s STYLES
// ===========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#004080',
    letterSpacing: 1,
    fontFamily: 'Courier New',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Form
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004080',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  phone: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004080',
    marginBottom: 20,
  },

  // Input Fields
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#fff',
    padding: 12,
    fontSize: 15,
    fontFamily: 'Arial',
  },

  // Continue Button
  continueBtn: {
    backgroundColor: '#004080',
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },

  // Login Link
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#004080',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // OTP Input
  otpInput: {
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Courier New',
  },

  // Verify Button
  verifyBtn: {
    backgroundColor: '#004080',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },

  // Back Link
  backLink: {
    color: '#004080',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});