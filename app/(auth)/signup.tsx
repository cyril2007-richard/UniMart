import { useRouter } from 'expo-router';
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
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

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
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.tint,
      letterSpacing: 1,
    },
    tagline: {
      fontSize: 14,
      color: colors.text,
      marginTop: 6,
      fontStyle: 'italic',
    },

    // Form
    form: {
      backgroundColor: colors.background,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.tabIconDefault,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 20,
      textAlign: 'center',
    },

    // Input Fields
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 6,
      fontWeight: '600',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.tabIconDefault,
      backgroundColor: colors.background,
      padding: 12,
      fontSize: 15,
      color: colors.text,
    },

    // Continue Button
    continueBtn: {
      backgroundColor: 'transparent',
      padding: 14,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.tint,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    continueText: {
      color: colors.tint,
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
      color: colors.text,
    },
    loginLinkText: {
      fontSize: 14,
      color: colors.tint,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
  });

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
                keyboardType={field.keyboard === 'email-address' ? 'email-address' : field.keyboard === 'phone-pad' ? 'phone-pad' : 'default'}
                secureTextEntry={field.secure || false}
                autoCapitalize="none"
                placeholderTextColor={colors.tabIconDefault}
              />
            </View>
          ))}

          <TouchableOpacity style={[styles.continueBtn, { opacity: loading ? 0.5 : 1 }]} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.tint} style={{ marginRight: 10 }} />
            ) : null}
            <Text style={styles.continueText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLinkText}> Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}