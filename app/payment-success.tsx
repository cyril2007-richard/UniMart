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
          <Check size={50} color="white" strokeWidth={2} />
        </Animated.View>
        
                <Text style={[styles.title, { color: theme.text }]}>Payment Successful</Text>
        
                <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        
                  Your order has been placed successfully. You can track your delivery in the activity section.
        
                </Text>
        
        
        
                <TouchableOpacity 
        
                    style={[styles.button, { backgroundColor: theme.primary }]}
        
                    onPress={() => router.replace('/(app)/(tabs)')}
        
                >
        
                    <Text style={styles.buttonText}>Continue Shopping</Text>
        
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
        
            borderRadius: 14,
        
            padding: 40,
        
            alignItems: 'center',
        
            shadowColor: "#000",
        
            shadowOffset: { width: 0, height: 4 },
        
            shadowOpacity: 0.05,
        
            shadowRadius: 10,
        
            elevation: 3,
        
          },
        
          iconContainer: {
        
            width: 80,
        
            height: 80,
        
            borderRadius: 40,
        
            justifyContent: 'center',
        
            alignItems: 'center',
        
            marginBottom: 24,
        
          },
        
          title: {
        
            fontSize: 22,
        
            fontWeight: '700',
        
            marginBottom: 12,
        
            textAlign: 'center',
        
          },
        
          subtitle: {
        
            fontSize: 15,
        
            textAlign: 'center',
        
            marginBottom: 32,
        
            lineHeight: 22,
        
          },
        
          button: {
        
            width: '100%',
        
            paddingVertical: 16,
        
            borderRadius: 12,
        
            alignItems: 'center',
        
          },
        
          buttonText: {
        
            color: 'white',
        
            fontSize: 16,
        
            fontWeight: '600',
        
          },
        
        });
        
        