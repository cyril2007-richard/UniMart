import { Tabs } from 'expo-router';
import { Home, MessageCircle, Plus, Search, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import Colors from '../../../constants/Colors';

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: any;
  color: string;
  focused: boolean;
}) {
  const colors = Colors.light;
  const styles = StyleSheet.create({
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 50,
      height: 50,
    },
    activeDot: {
      position: 'absolute',
      bottom: 0,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.tint,
    },
  });
  return (
    <View style={styles.iconContainer}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function AddButton({ focused }: { focused: boolean }) {
  const colors = Colors.light;
  const styles = StyleSheet.create({
    addButtonContainer: {
      width: 60,
      height: 60,
      marginTop: 0,
    },
    addButtonContainerActive: {
      marginTop: -20,
    },
    addButton: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.tint,
      backgroundColor: colors.background,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
  return (
    <View
      style={[
        styles.addButtonContainer,
        focused && styles.addButtonContainerActive,
      ]}
    >
      <View style={styles.addButton}>
        <Plus size={28} color={colors.tint} strokeWidth={3} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colors = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? 10 : 6,
          paddingTop: 16,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.tabIconDefault,
          elevation: 8,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Search} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ focused }) => <AddButton focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={MessageCircle} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
