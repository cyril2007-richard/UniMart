import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Colors from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors.light;

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = login(username, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid username or password');
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

    // Logo
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoText: {
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
    welcome: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 20,
      textAlign: 'center',
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
      marginBottom: 16,
      color: colors.text,
    },

    forgot: {
      alignSelf: 'flex-end',
      marginBottom: 20,
    },
    forgotText: {
      color: colors.tint,
      fontSize: 13,
      textDecorationLine: 'underline',
    },

    // Sign In Button
    signInBtn: {
      backgroundColor: 'transparent',
      padding: 14,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.tint,
    },
    signInText: {
      color: colors.tint,
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 1,
    },

    // Divider
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.tabIconDefault,
    },
    or: {
      marginHorizontal: 12,
      color: colors.text,
      fontSize: 13,
    },

    // Google Button
    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.tabIconDefault,
      padding: 12,
      backgroundColor: 'transparent',
    },
    googleG: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4285F4',
      marginRight: 10,
    },
    googleText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },

    // Sign Up
    signup: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    signupText: {
      fontSize: 14,
      color: colors.text,
    },
    signupLink: {
      fontSize: 14,
      color: colors.tint,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
  });

  return (
    <>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* === NOSTALGIC LOGO === */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>UniMarket</Text>
            <Text style={styles.tagline}>Your campus marketplace since 2025</Text>
          </View>

          {/* === LOGIN FORM === */}
          <View style={styles.form}>
            <Text style={styles.welcome}>Welcome back!</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={colors.tabIconDefault}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.tabIconDefault}
            />

            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* === CLASSIC SIGN IN BUTTON === */}
            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            {/* === DIVIDER === */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>or continue with</Text>
              <View style={styles.line} />
            </View>

            {/* === RETRO GOOGLE BUTTON === */}
            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* === SIGN UP LINK === */}
          <View style={styles.signup}>
            <Text style={styles.signupText}>New here? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}