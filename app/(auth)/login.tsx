import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/CustomAlert';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const theme = Colors.light;

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login(usernameOrEmail, password);
    if (success) {
      router.replace('/(app)/(tabs)');
    } else {
      setAlertVisible(true);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.lightPurple }]}>
                <User size={40} color={theme.purple} strokeWidth={1.5} />
            </View>
            <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome Back!</Text>
            <Text style={[styles.subtitleText, { color: theme.secondaryText }]}>
              Sign in to continue to UniMart
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
              <Mail size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email or Username"
                placeholderTextColor={theme.tabIconDefault}
                value={usernameOrEmail}
                onChangeText={setUsernameOrEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
              <Lock size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.tabIconDefault}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={theme.tabIconDefault} />
                ) : (
                  <Eye size={20} color={theme.tabIconDefault} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.purple }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.purple }]}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.surface }]} />
              <Text style={[styles.dividerText, { color: theme.secondaryText }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.surface }]} />
            </View>

            {/* Social Login */}
            <TouchableOpacity
              style={[styles.googleButton, { borderColor: theme.surface, backgroundColor: theme.background }]}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                style={styles.googleLogoImage} 
              />
              <Text style={[styles.googleButtonText, { color: theme.text }]}>Sign in with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.appleButton, { backgroundColor: 'black' }]}
                activeOpacity={0.7}
              >
                {/* Simulating Apple Logo */}
                <Text style={[styles.appleIcon, { color: 'white' }]}></Text>
                <Text style={[styles.appleButtonText, { color: 'white' }]}>Sign in with Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: theme.secondaryText }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={[styles.signupText, { color: theme.purple }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => router.replace('/(app)/(tabs)')}
          >
            <Text style={[styles.skipText, { color: theme.secondaryText }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title="Login Failed"
        message="Invalid email or password. Please try again."
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 10, // Increased touch target
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    height: 50, // Standard accessible height
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  googleLogoImage: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 24,
  },
  appleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16, // Add padding for easier tap
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 8, // Add padding to the link itself
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
