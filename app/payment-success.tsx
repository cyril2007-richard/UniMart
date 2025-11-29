import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import Colors from '../constants/Colors';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Animated.View style={[styles.iconContainer, { backgroundColor: '#4CAF50', transform: [{ scale: scaleValue }] }]}>
          <Check size={50} color="white" strokeWidth={3} />
        </Animated.View>
        
        <Text style={[styles.title, { color: theme.text }]}>Payment Successful!</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Your order has been placed successfully. You will receive a confirmation shortly.
        </Text>

        <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.purple }]}
            onPress={() => router.replace('/(app)/(tabs)')}
        >
            <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.purple }]}
            onPress={() => router.replace('/(app)/(tabs)/chat')}
        >
            <Text style={[styles.secondaryButtonText, { color: theme.purple }]}>View Chats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});