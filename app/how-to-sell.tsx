
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function HowToSellScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Sell</Text>
      <Text style={styles.text}>1. Tap the '+' button to create a new listing.</Text>
      <Text style={styles.text}>2. Fill in the details of your item, including photos and price.</Text>
      <Text style={styles.text}>3. Wait for buyers to contact you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});
