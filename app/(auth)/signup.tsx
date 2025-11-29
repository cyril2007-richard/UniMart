import { useRouter } from 'expo-router';
import { Book, Lock, Mail, Phone, User, UserCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
    matricNumber: '',
    faculty: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const theme = Colors.light;

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);
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
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const success = await signup({
        ...formData,
        profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
      });

      if (success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(app)/(tabs)') },
        ]);
      } else {
        Alert.alert('Error', 'Email or username already exists');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Join UniMart to start buying and selling
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
            <User size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.tabIconDefault}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
            <UserCircle size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Username"
              placeholderTextColor={theme.tabIconDefault}
              value={formData.username}
              onChangeText={(text) => updateFormData('username', text)}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
            <Mail size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Email Address"
              placeholderTextColor={theme.tabIconDefault}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
            <Phone size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Phone Number"
              placeholderTextColor={theme.tabIconDefault}
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData('phoneNumber', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Matric No."
                placeholderTextColor={theme.tabIconDefault}
                value={formData.matricNumber}
                onChangeText={(text) => updateFormData('matricNumber', text)}
              />
            </View>
            <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Faculty"
                placeholderTextColor={theme.tabIconDefault}
                value={formData.faculty}
                onChangeText={(text) => updateFormData('faculty', text)}
              />
            </View>
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.surface }]}>
            <Lock size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.tabIconDefault}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: theme.purple }, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.loginText, { color: theme.purple }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
