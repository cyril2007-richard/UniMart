import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function ApplyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Become a Rider</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="bicycle-outline" size={100} color={Colors.light.purple} />
        <Text style={styles.subtitle}>Join our team of student riders!</Text>
        <Text style={styles.description}>
          As a UniMart rider, you'll help deliver items across campus and earn money on your own schedule.
        </Text>
        <Text style={styles.heading}>Requirements:</Text>
        <Text style={styles.listItem}>• A bicycle or scooter in good condition</Text>
        <Text style={styles.listItem}>• A valid student ID</Text>
        <Text style={styles.listItem}>• A smartphone with the UniMart app</Text>
        <Text style={styles.listItem}>• A friendly and reliable attitude</Text>

        <Text style={styles.heading}>How to Apply:</Text>
        <Text style={styles.description}>
          To apply, please send an email to <Text style={styles.email}>riders@unimart.com</Text> with your name, student ID, and a brief introduction.
        </Text>

        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: Colors.light.text,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  email: {
    color: Colors.light.purple,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.light.purple,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 30,
  },
  applyButtonText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: '600',
  },
});