
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';

export default function NewChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Chat</Text>
      <TextInput style={styles.input} placeholder="Enter Seller ID" />
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Chat</Text>
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
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
