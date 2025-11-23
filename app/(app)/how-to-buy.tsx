
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import { CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const InstructionStep = ({ number, text }: { number: number; text: string }) => (
  <View style={styles.stepContainer}>
    <View style={[styles.stepNumber, { backgroundColor: Colors.light.surface }]}>
      <Text style={[styles.stepNumberText, { color: Colors.light.secondaryText }]}>{number}</Text>
    </View>
    <Text style={[styles.text, { color: Colors.light.text }]}>{text}</Text>
  </View>
);

export default function HowToBuyScreen() {
  const theme = Colors.light;
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={() => router.back()}>
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <TouchableWithoutFeedback>
          <View style={[styles.contentContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
              <CheckCircle size={28} color={theme.purple} strokeWidth={2} />
              <Text style={[styles.title, { color: theme.text }]}>How to Buy</Text>
            </View>
            <InstructionStep number={1} text="Browse for items using the search bar or by exploring categories." />
            <InstructionStep number={2} text="Tap on an item to see more details." />
            <InstructionStep number={3} text="Contact the seller to arrange for purchase and pickup." />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    padding: 28,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});
