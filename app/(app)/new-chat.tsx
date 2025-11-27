
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';

export default function NewChatScreen() {
  const theme = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>New Chat</Text>
      <TextInput 
        style={[styles.input, { borderColor: theme.tabIconDefault, color: theme.text, backgroundColor: theme.surface }]} 
        placeholder="Enter Seller ID" 
        placeholderTextColor={theme.tabIconDefault}
      />
      <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.purple }]}>
        <Text style={[styles.startButtonText, { color: theme.white }]}>Start Chat</Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  startButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    fontWeight: 'bold',
  },
});
