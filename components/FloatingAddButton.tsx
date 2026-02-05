import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function FloatingAddButton() {
  const router = useRouter();
  const theme = Colors.light;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.purple, shadowColor: theme.purple }]}
        onPress={() => router.push('/(app)/add')}
        activeOpacity={0.8}
      >
        <Plus color="white" size={32} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Adjusted to sit above tab bar
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
