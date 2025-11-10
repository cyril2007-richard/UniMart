import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          name: 'View Profile',
          action: () => router.push('/(tabs)/profile'),
          color: '#3498db',
        },
        {
          icon: 'log-out-outline',
          name: 'Logout',
          action: handleLogout,
          color: '#e74c3c',
        },
      ],
    },
    {
      title: 'Information',
      items: [
        {
          icon: 'help-circle-outline',
          name: 'How to Buy',
          action: () => router.push('/how-to-buy'),
          color: '#2ecc71',
        },
        {
          icon: 'cash-outline',
          name: 'How to Sell',
          action: () => router.push('/how-to-sell'),
          color: '#f39c12',
        },
        {
          icon: 'headset-outline',
          name: 'Support',
          action: () => router.push('/support'),
          color: '#9b59b6',
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {currentUser && (
        <View style={styles.profileSection}>
          <Ionicons name="person-circle-outline" size={60} color={Colors.light.purple} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
          </View>
        </View>
      )}

      {menuItems.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity key={itemIndex} style={styles.menuItem} onPress={item.action}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={22} color="#fff" />
              </View>
              <Text style={styles.menuItemText}>{item.name}</Text>
              <Ionicons name="chevron-forward-outline" size={22} color={Colors.light.gray} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.white,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.gray,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});