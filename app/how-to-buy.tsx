
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function HowToBuyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Buy</Text>
      <Text style={styles.text}>1. Browse for items using the search bar or by exploring categories.</Text>
      <Text style={styles.text}>2. Tap on an item to see more details.</Text>
      <Text style={styles.text}>3. Contact the seller to arrange for purchase and pickup.</Text>
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
