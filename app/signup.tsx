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
import Colors from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
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

  const handleContinue = () => {
    // Validate all fields
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check if email is allowed domain
    const allowedDomains = ['gmail.com', 'uniben.edu', 'eng.uniben.com'];
    const emailDomain = formData.email.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
      Alert.alert('Error', 'Only Gmail and UNIBEN student emails are allowed');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Validate phone number
    if (formData.phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Move to OTP verification
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

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (step === 2) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>UniMarket</Text>
          </View>

          <Text style={styles.otpTitle}>Enter verification code</Text>
          <Text style={styles.otpSubtitle}>
            We sent a code to {formData.phoneNumber}
          </Text>
          <Text style={styles.otpHint}>
            Hint: Use 123456
          </Text>

          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity style={styles.signupButton} onPress={handleVerifyOTP}>
            <Text style={styles.signupButtonText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>Back to sign up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>UniMarket</Text>
        </View>

        <Text style={styles.subtitle}>
          Sign up to buy and sell on campus
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={formData.username}
            onChangeText={(text) => updateFormData('username', text)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Matric Number"
            placeholderTextColor="#999"
            value={formData.matricNumber}
            onChangeText={(text) => updateFormData('matricNumber', text)}
            autoCapitalize="characters"
          />

          <TextInput
            style={styles.input}
            placeholder="Faculty"
            placeholderTextColor="#999"
            value={formData.faculty}
            onChangeText={(text) => updateFormData('faculty', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData('phoneNumber', text)}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.signupButton} onPress={handleContinue}>
            <Text style={styles.signupButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.light.purple,
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E8E',
    fontSize: 16,
    marginBottom: 30,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 5,
    padding: 15,
    marginBottom: 12,
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: Colors.light.purple,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#8E8E8E',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.light.purple,
    fontWeight: '600',
    fontSize: 14,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  otpSubtitle: {
    textAlign: 'center',
    color: '#8E8E8E',
    fontSize: 14,
    marginBottom: 10,
  },
  otpHint: {
    textAlign: 'center',
    color: Colors.light.purple,
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  otpInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    fontSize: 24,
    letterSpacing: 10,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: Colors.light.purple,
    fontSize: 14,
  },
});