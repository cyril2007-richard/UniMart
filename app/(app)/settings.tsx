import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, User, HelpCircle, BadgeDollarSign, LifeBuoy, UserCircle } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const theme = Colors.light;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          name: 'View Profile',
          action: () => router.push('/(app)/(tabs)/profile'),
        },
        {
          icon: LogOut,
          name: 'Logout',
          action: handleLogout,
          isDestructive: true,
        },
      ],
    },
    {
      title: 'Information',
      items: [
        {
          icon: HelpCircle,
          name: 'How to Buy',
          action: () => router.push('/(app)/how-to-buy'),
        },
        {
          icon: BadgeDollarSign,
          name: 'How to Sell',
          action: () => router.push('/(app)/how-to-sell'),
        },
        {
          icon: LifeBuoy,
          name: 'Support',
          action: () => router.push('/(app)/support'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {currentUser && (
          <View style={styles.profileSection}>
            <UserCircle size={52} color={theme.purple} strokeWidth={1.5} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{currentUser.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>{currentUser.email}</Text>
            </View>
          </View>
        )}

        {menuItems.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>{section.title}</Text>
            <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const itemColor = item.isDestructive ? '#e74c3c' : theme.text;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && styles.menuItemBorder,
                      { borderBottomColor: theme.background }
                    ]}
                    onPress={item.action}
                  >
                    <View style={styles.menuItemContent}>
                      <Icon size={20} color={itemColor} strokeWidth={1.5} />
                      <Text style={[styles.menuItemText, { color: itemColor }]}>{item.name}</Text>
                    </View>
                    <ChevronRight size={20} color={theme.secondaryText} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 12,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  menuContainer: {
    borderRadius: 12,
    marginHorizontal: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});